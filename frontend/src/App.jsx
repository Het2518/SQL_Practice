import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { loadSettings, saveSettings, defaultSettings } from '@/features/profile/settingsConfig';
import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/shared/ui/ToastSystem';


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

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker
              .getRegistrations()
              .then((regs) => {
                for (let reg of regs) {
                  reg.unregister();
                }
              })
              .catch(() => {});
          }

          // cache bust and reload
          window.location.assign(window.location.pathname + '?reload=' + Date.now());
        } else {
          reject(error);
        }
      });
  });
};

const DbSelector = lazy(() =>
  lazyRetry(() => import('@/pages/HomePage').then((module) => ({ default: module.DbSelector })))
);
const PracticeView = lazy(() =>
  lazyRetry(() =>
    import('@/pages/PracticePage').then((module) => ({ default: module.PracticeView }))
  )
);
const ProfileView = lazy(() =>
  lazyRetry(() =>
    import('@/features/profile/ProfileView').then((module) => ({ default: module.ProfileView }))
  )
);
const UserGuide = lazy(() =>
  lazyRetry(() => import('@/pages/UserGuide').then((module) => ({ default: module.UserGuide })))
);
const InterviewPage = lazy(() =>
  lazyRetry(() =>
    import('@/features/interview/InterviewDashboard').then((module) => ({
      default: module.InterviewPage,
    }))
  )
);
const InterviewPermissions = lazy(() =>
  lazyRetry(() =>
    import('@/features/interview/InterviewPermissions').then((module) => ({
      default: module.InterviewPermissions,
    }))
  )
);
const InterviewPreFlight = lazy(() =>
  lazyRetry(() =>
    import('@/features/interview/InterviewPreFlight').then((module) => ({
      default: module.InterviewPreFlight,
    }))
  )
);
const InterviewArena = lazy(() =>
  lazyRetry(() =>
    import('@/features/interview/InterviewArena').then((module) => ({
      default: module.InterviewArena,
    }))
  )
);
const InterviewReport = lazy(() =>
  lazyRetry(() =>
    import('@/features/interview/InterviewReport').then((module) => ({
      default: module.InterviewReport,
    }))
  )
);
const AuthPage = lazy(() =>
  lazyRetry(() => import('@/pages/AuthPage'))
);
const SettingsModal = lazy(() =>
  lazyRetry(() =>
    import('@/features/profile/SettingsModal').then((module) => ({ default: module.SettingsModal }))
  )
);
const PrivacyPolicy = lazy(() =>
  lazyRetry(() => import('@/pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })))
);
const TermsAndServices = lazy(() =>
  lazyRetry(() => import('@/pages/TermsAndServices').then((module) => ({ default: module.TermsAndServices })))
);
const CompanyPrepPage = lazy(() => lazyRetry(() => import('@/pages/CompanyPrepPage')));
const CustomDatasetPage = lazy(() =>
  lazyRetry(() =>
    import('@/pages/CustomDatasetPage').then((m) => ({ default: m.CustomDatasetPage }))
  )
);
const LeaderboardPage = lazy(() =>
  lazyRetry(() => import('@/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })))
);


// ─── Protected Route Component ───────────────────────────────────────────────
function ProtectedRoute({ children, user, isCheckingSession }) {
  if (!user && isCheckingSession) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg text-text">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-surface-3 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isCheckingSession, logout, initializeAuth } = useAuth();

  const {
    progress,
    syncFromServer: syncProgressServer,
  } = useProgressStore();
  const { gameState, syncFromServer: syncGamificationServer } = useGamificationStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Settings dark mode effect is now handled inside useSettingsStore update functions
  // But we need to initialize it once on mount
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('sql-platform-settings') ?? '{}');
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      navigate('/login', { replace: true });
    }

    if (window.location.hash && window.location.hash.includes('error_description')) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const errorMsg = hashParams.get('error_description');
      if (errorMsg) {
        // Use toast instead of alert() — avoids blocking the thread and XSS risk
        toast({
          type: 'error',
          title: 'Authentication Error',
          message: decodeURIComponent(errorMsg).replace(/\+/g, ' ').slice(0, 200),
        });
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location, navigate]);

  // ── Load progress & gamification from API when user logs in ────────────────
  useEffect(() => {
    if (user) {
      syncProgressServer(user);
      syncGamificationServer(user);
    } else {
      useProgressStore.getState().resetProgress();
      useGamificationStore.getState().resetGamification();
    }
  }, [user, syncProgressServer, syncGamificationServer]);

  // ── No client → server sync needed: updates are fired directly in updateProgress ──

  const handleProgressUpdate = useCallback(
    (question, dbName, status, sql, executionTimeMs = 0) => {
      if (!question || !question.id) return;
      const id = question.id;
      
      useProgressStore.getState().updateProgress(id, status);

      // Always record activity to backend (creates Submission record)
      // This is now the only way backend knows about progress/attempts.
      useGamificationStore.getState().recordActivity(question, dbName, status, user, sql, executionTimeMs);
    },
    [user]
  );

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-bg">
          <div className="w-8 h-8 border-3 border-surface-3 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <DbSelector
              progress={progress}
              gameState={gameState}
              user={user}
              onShowAuth={() => navigate('/login')}
              onShowSettings={() => setShowSettings(true)}
              onShowInterview={() => navigate('/interview')}
            />
          }
        />

        <Route
          path="/guide"
          element={
            <UserGuide
              user={user}
              onShowAuth={() => navigate('/login')}
              onShowSettings={() => setShowSettings(true)}
            />
          }
        />

        <Route
          path="/interview"
          element={
            <InterviewPage
              user={user}
              onShowAuth={() => navigate('/login')}
              onShowSettings={() => setShowSettings(true)}
            />
          }
        />
        <Route path="/interview/permissions" element={<InterviewPermissions />} />
        
        {/* Legal Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndServices />} />
        <Route path="/interview/preflight" element={<InterviewPreFlight />} />
        <Route path="/interview/arena" element={<InterviewArena />} />
        <Route path="/interview/report" element={<InterviewReport />} />
        <Route
          path="/company/:slug"
          element={
            <CompanyPrepPage
              user={user}
              onShowAuth={() => navigate('/login')}
              onShowSettings={() => setShowSettings(true)}
            />
          }
        />

        <Route path="/sandbox" element={<CustomDatasetPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/practice" element={<Navigate to="/practice/airlines" replace />} />
        
        <Route
          path="/practice/:db"
          element={
            <PracticeView
              progress={progress}
              gameState={gameState}
              user={user}
              onShowAuth={() => navigate('/login')}
              onShowSettings={() => setShowSettings(true)}
              onProgressUpdate={handleProgressUpdate}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} isCheckingSession={isCheckingSession}>
              <ProfileView
                user={user}
                gameState={gameState}
                progress={progress}
                onHome={() => navigate('/')}
                onSignOut={async () => {
                  await logout();
                  Object.keys(localStorage).forEach((key) => {
                    if (
                      key.startsWith('sql-') ||
                      key === 'sql-platform-settings' ||
                      key === 'sql-practice-gamification'
                    ) {
                      localStorage.removeItem(key);
                    }
                  });
                  window.location.href = '/';
                }}
              />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </Suspense>
  );
}

// AppWrapper removed — was dead code duplicating App's login param logic
