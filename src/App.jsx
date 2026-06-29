import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadSettings, SettingsModal, defaultSettings } from '@/features/profile/SettingsModal';
import { ProfileView } from '@/features/profile/ProfileView';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/features/auth/AuthModal';
import { UserGuide } from '@/pages/UserGuide';
import { InterviewDashboard } from '@/features/interview/InterviewDashboard';
import '@/styles.css';

// Lazy load large views for performance
const DbSelector = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.DbSelector })));
const PracticeView = lazy(() => import('@/pages/PracticePage').then(module => ({ default: module.PracticeView })));

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
  const [progress, setProgress] = useState(loadProgress);
  const { user, loading, logout } = useAuth();
  const { gameState, recordActivity } = useGamification(progress, user);
  const [showAuth, setShowAuth] = useState(false);
  
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadSettings() }));
  const [showSettings, setShowSettings] = useState(false);
  const [showInterview, setShowInterview] = useState(false);

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

  useEffect(() => {
    if (user && Object.keys(progress).length > 0) {
      const syncTimeout = setTimeout(() => {
        supabase.from('user_progress').upsert({ 
          user_id: user.id, 
          completed_questions: progress,
          display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Player'
        }).then();
      }, 2000);
      return () => clearTimeout(syncTimeout);
    }
  }, [progress, user]);

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
        <Route path="/" element={<DbSelector progress={progress} gameState={gameState} user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} onShowInterview={() => setShowInterview(true)} settings={settings} onToggleDark={toggleDark} />} />

        <Route path="/guide" element={<UserGuide />} />
        
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
      {showInterview && <InterviewDashboard onClose={() => setShowInterview(false)} />}
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
