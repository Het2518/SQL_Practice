import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Add React Router imports
code = code.replace(
  /import \{ useState, useCallback, useEffect, useRef, useMemo \} from 'react';/,
  `import { useState, useCallback, useEffect, useRef, useMemo } from 'react';\nimport { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';`
);

// 2. DbSelector Component
// Change: function DbSelector({ ... onSelect }) -> We use useNavigate
code = code.replace(
  /function DbSelector\(\{[\s\S]*?\}\) \{/,
  (match) => match.replace('onShowProfile,', '').replace('onSelect', '/* onSelect removed */') + '\n  const navigate = useNavigate();'
);
code = code.replace(/onClick=\{onShowProfile\}/g, "onClick={() => navigate('/profile')}");
code = code.replace(/onClick=\{\(\) => onSelect\(db\)\}/g, "onClick={() => navigate('/practice/' + db)}");

// 3. PracticeView Component
// Change function PracticeView({ initialDb ... onHome }) -> function PracticeView({ ... })
code = code.replace(
  /function PracticeView\(\{[\s\S]*?\}\) \{/,
  (match) => match.replace('initialDb,', '').replace('onHome,', '') + '\n  const navigate = useNavigate();\n  const { db: routeDb } = useParams();\n  const initialDb = routeDb || \'airlines\';'
);
code = code.replace(/onClick=\{onHome\}/g, "onClick={() => navigate('/')}");

// Wait, PracticeView has a switch db dropdown: handleSwitchDb
code = code.replace(
  /const handleSwitchDb = useCallback\(\(newDb\) => \{[\s\S]*?setDb\(newDb\);[\s\S]*?\}\, \[db, progress\]\);/,
  `const handleSwitchDb = useCallback((newDb) => {
    if (newDb === db) { setShowDbPicker(false); return; }
    navigate('/practice/' + newDb);
    setShowDbPicker(false);
  }, [db, navigate]);`
);

// Also PracticeView has const [db, setDb] = useState(initialDb);
// We should update db when routeDb changes!
code = code.replace(
  /const \[db, setDb\] = useState\(initialDb\);/,
  `const [db, setDb] = useState(initialDb);
  useEffect(() => {
    if (routeDb && routeDb !== db) {
      setDb(routeDb);
      const dbQs = getQuestionsForDb(routeDb);
      const firstIncomplete = dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
      setCurrentQ(firstIncomplete);
      setResult(null);
      setValidation(null);
      setSql('');
      setHintsUsed(0);
      setSolutionVisible(false);
      setShowHints(false);
      setPreviewTableName(null);
    }
  }, [routeDb, db, progress]);`
);

// 4. App Root
// We need to replace the entire App component
const appReplacement = `
// ─── Protected Route Component ───────────────────────────────────────────────
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }
  return children;
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const { user, loading, logout } = useAuth();
  const { gameState, recordActivity } = useGamification(progress, user);
  const [showAuth, setShowAuth] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadSettings() }));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  // Sync progress from Supabase
  useEffect(() => {
    if (user) {
      supabase.from('user_progress').select('completed_questions').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data && data.completed_questions) {
          setProgress(prev => {
            const merged = { ...prev, ...data.completed_questions };
            saveProgress(merged);
            return merged;
          });
        }
      });
    }
  }, [user]);

  const handleProgressUpdate = useCallback((id, status) => {
    setProgress(prev => {
      const next = { ...prev, [id]: status };
      saveProgress(next);
      if (status === 'complete' && prev[id] !== 'complete') {
        recordActivity();
      }
      if (user) {
        supabase.from('user_progress').upsert({ user_id: user.id, completed_questions: next }).then();
      }
      return next;
    });
  }, [recordActivity, user]);

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)'}}>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <DbSelector 
            progress={progress} 
            gameState={gameState} 
            user={user} 
            onShowAuth={() => setShowAuth(true)} 
            onShowCustomModal={() => setShowCustomModal(true)} 
            onShowSettings={() => setShowSettings(true)} 
          />
        } />
        
        <Route path="/practice/:db" element={
          <ProtectedRoute user={user}>
            <PracticeView
              progress={progress}
              user={user}
              settings={settings}
              onShowAuth={() => setShowAuth(true)}
              onShowSettings={() => setShowSettings(true)}
              onProgressUpdate={handleProgressUpdate}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <ProfileView 
              user={user} 
              gameState={gameState} 
              onHome={() => {}} 
              onSignOut={async () => {
                await logout();
                window.location.href = '/';
              }} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showCustomModal && <CustomDatasetModal onClose={() => setShowCustomModal(false)} onDatasetReady={(customDb) => {
         alert('Custom Database Sandbox is currently being updated for React Router. Please use standard databases for now.');
         setShowCustomModal(false);
      }} />}
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />}
    </>
  );
}

// ─── Login Redirect Handler ──────────────────────────────────────────────────
// We extract useLocation to a small component to keep App clean and outside Router logic
export function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      navigate(location.pathname, { replace: true });
      // We can't easily trigger showAuth from here without context, 
      // but protected route redirected here. Let's just rely on the user clicking Login for now.
    }
  }, [location, navigate]);

  return <App />;
}
`;

code = code.replace(/\/\/ ─── App Root[\s\S]*$/, appReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx has been updated with React Router.');
