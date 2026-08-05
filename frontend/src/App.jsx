import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useAuth } from '@/stores/useAuthStore';
import { useToast } from '@/shared/ui/ToastSystem';
import { NotFoundPage } from '@/pages/NotFoundPage';


// Lazy load large views for performance with automatic retry for chunk errors
const lazyRetry = (componentImport) => {
  return new Promise((resolve, reject) => {
    componentImport()
      .then((module) => {
        // Reset retry flag on success so future deploys can retry again
        window.sessionStorage.removeItem('datadesk_chunk_retry');
        resolve(module);
      })
      .catch((error) => {
        const hasRetried = window.sessionStorage.getItem('datadesk_chunk_retry');
        if (!hasRetried) {
          // Mark retry BEFORE reloading so we don't loop infinitely
          window.sessionStorage.setItem('datadesk_chunk_retry', 'true');

          // Unregister stale service workers
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker
              .getRegistrations()
              .then((regs) => { for (let reg of regs) reg.unregister(); })
              .catch(() => {});
          }

          // Hard reload with cache-bust to pick up new chunk hashes
          window.location.href = window.location.pathname + window.location.search + '?_cb=' + Date.now();
        } else {
          // Already retried once — clear flag and surface error
          window.sessionStorage.removeItem('datadesk_chunk_retry');
          reject(error);
        }
      });
  });
};

// ─── Error Boundary for lazy chunk failures ───────────────────────────────────
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    if (err?.message?.includes('dynamically imported module') || err?.message?.includes('Failed to fetch')) {
      // Clear retry flag and hard reload to pick up fresh chunks
      window.sessionStorage.removeItem('datadesk_chunk_retry');
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Loading a new version...</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>The app was updated. Refreshing automatically.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Reload Now</button>
        </div>
      );
    }
    return this.props.children;
  }
}


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
  const { gameState } = useGamificationStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      navigate('/login', { replace: true });
    }

    if (window.location.hash && window.location.hash.includes('error_description')) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const rawErrorMsg = hashParams.get('error_description');
      if (rawErrorMsg) {
        // Sanitize: allow only printable ASCII letters, digits, spaces, and basic punctuation.
        // This prevents crafted URLs from injecting arbitrary content into the toast.
        const safeMsg = decodeURIComponent(rawErrorMsg)
          .replace(/\+/g, ' ')
          .replace(/[^\w\s.,!?:;'"\-()[\]]/g, '')
          .slice(0, 200);
        toast({
          type: 'error',
          title: 'Authentication Error',
          message: safeMsg || 'An unknown authentication error occurred.',
        });
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location, navigate]);

  // ── Load progress & gamification from API when user logs in ────────────────
  useEffect(() => {
    if (user) {
      syncProgressServer(user);
    } else {
      useProgressStore.getState().resetProgress();
      useGamificationStore.getState().resetGamification();
    }
  }, [user, syncProgressServer]);

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
    <ChunkErrorBoundary>
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {showSettings && (
        <Suspense fallback={null}>
          <SettingsModal onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
    </Suspense>
    </ChunkErrorBoundary>
  );
}

// AppWrapper removed — was dead code duplicating App's login param logic
