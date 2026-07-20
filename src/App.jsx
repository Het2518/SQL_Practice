import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadSettings, defaultSettings } from '@/features/profile/settingsConfig';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/styles.css';

// Lazy load large views for performance with automatic retry for chunk errors
const lazyRetry = (componentImport) => {
  return new Promise((resolve, reject) => {
    // try to import the component
    componentImport()
      .then(resolve)
      .catch((error) => {
        // if it fails, check if we've already retried
        const hasRetried = window.sessionStorage.getItem('datadesk_chunk_retry');
        if (!hasRetried) {
          window.sessionStorage.setItem('datadesk_chunk_retry', 'true');
          // cache bust and reload
          window.location.assign(window.location.pathname + '?reload=' + Date.now());
        } else {
          reject(error);
        }
      });
  });
};

const DbSelector = lazy(() => lazyRetry(() => import('@/pages/HomePage').then(module => ({ default: module.DbSelector }))));
const PracticeView = lazy(() => lazyRetry(() => import('@/pages/PracticePage').then(module => ({ default: module.PracticeView }))));
const ProfileView = lazy(() => lazyRetry(() => import('@/features/profile/ProfileView').then(module => ({ default: module.ProfileView }))));
const UserGuide = lazy(() => lazyRetry(() => import('@/pages/UserGuide').then(module => ({ default: module.UserGuide }))));
const InterviewPage = lazy(() => lazyRetry(() => import('@/features/interview/InterviewDashboard').then(module => ({ default: module.InterviewPage }))));
const AuthModal = lazy(() => lazyRetry(() => import('@/features/auth/AuthModal').then(module => ({ default: module.AuthModal }))));
const SettingsModal = lazy(() => lazyRetry(() => import('@/features/profile/SettingsModal').then(module => ({ default: module.SettingsModal }))));
const CompanyPrepPage = lazy(() => lazyRetry(() => import('@/pages/CompanyPrepPage')));
const CustomDatasetPage = lazy(() => lazyRetry(() => import('@/pages/CustomDatasetPage').then(m => ({ default: m.CustomDatasetPage }))));

// ─── Progress persistence ────────────────────────────────────────────────────
const PROGRESS_KEY = 'sql-practice-progress';
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}'); } catch { return {}; }
}
function saveProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }

// ─── Protected Route Component ───────────────────────────────────────────────
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }
  return children;
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const { user, loading, logout } = useAuth();
  const { gameState, recordActivity } = useGamification(progress, user, progressLoaded);
  const [showAuth, setShowAuth] = useState(false);
  
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadSettings() }));
  const [showSettings, setShowSettings] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const showInterviewPage = useCallback(() => navigate('/interview'), [navigate]);


  const toggleDark = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, darkMode: !prev.darkMode };
      localStorage.setItem('sql-platform-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setShowAuth(true);
      navigate(location.pathname, { replace: true });
    }
    
    if (window.location.hash && window.location.hash.includes('error_description')) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const errorMsg = hashParams.get('error_description');
      if (errorMsg) {
        alert('Authentication Error: ' + decodeURIComponent(errorMsg).replace(/\+/g, ' '));
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location, navigate]);

  // ── Load progress from Supabase when user logs in ──────────────────────────
  useEffect(() => {
    if (user) {
      setProgressLoaded(false); // reset on user change
      setProgress({});           // always start clean
      supabase
        .from('user_progress')
        .select('completed_questions')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data && data.completed_questions) {
            // Only set in-memory state — do NOT write to localStorage here.
            // localStorage is shared across all users on this machine.
            setProgress(data.completed_questions);
          }
          setProgressLoaded(true); // safe to start syncing back
        });
    } else {
      // User logged out — wipe progress immediately
      setProgress({});
      setProgressLoaded(false);
    }
  }, [user]);

  // ── Sync progress → Supabase (only AFTER initial load, never overwrite with empty) ──
  useEffect(() => {
    if (!user || !progressLoaded) return; // don't sync until we've loaded first
    const syncTimeout = setTimeout(() => {
      supabase.from('user_progress').upsert({
        user_id: user.id,
        completed_questions: progress,
        display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Player'
      }).then();
    }, 2000);
    return () => clearTimeout(syncTimeout);
  }, [progress, user, progressLoaded]);

  const handleProgressUpdate = useCallback((question, dbName, status) => {
    if (!question || !question.id) return;
    const id = question.id;
    setProgress(prev => {
      const next = { ...prev, [id]: status };
      saveProgress(next);
      if (status === 'complete' && prev[id] !== 'complete') {
        recordActivity(question, dbName, status);
      }
      return next;
    });
  }, [recordActivity, user]);

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)'}}>Loading...</div>;
  }

  return (
    <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)'}}><div className="spinner" /></div>}>
      <Routes>
        <Route path="/" element={<DbSelector progress={progress} gameState={gameState} user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} onShowInterview={showInterviewPage} settings={settings} onToggleDark={toggleDark} />} />

        <Route path="/guide" element={<UserGuide user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} settings={settings} onToggleDark={toggleDark} />} />
        
        <Route path="/interview" element={<InterviewPage user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} settings={settings} onToggleDark={toggleDark} />} />
        <Route path="/company/:slug" element={<CompanyPrepPage user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} settings={settings} onToggleDark={toggleDark} />} />
        
        <Route path="/sandbox" element={
          <CustomDatasetPage
            settings={settings}
            onToggleDark={toggleDark}
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
              onToggleDark={toggleDark}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <ProfileView 
              user={user} 
              gameState={gameState} 
              progress={progress} 
              settings={settings}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                localStorage.setItem('sql-platform-settings', JSON.stringify(newSettings));
              }}
              onHome={() => navigate('/')} 
              onSignOut={async () => {
                await logout();
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('sql-') || key === 'sql-platform-settings' || key === 'sql-practice-gamification') {
                    localStorage.removeItem(key);
                  }
                });
                setProgress({});
                window.location.href = '/';
              }} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />}

    </Suspense>
  );
}

export function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return <App />;
}
