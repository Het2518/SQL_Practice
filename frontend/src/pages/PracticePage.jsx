import React, { lazy, Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { useAuth } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToast } from '@/shared/ui/ToastSystem';
import { useConfetti } from '@/features/gamification/ConfettiBlast';
import { useQuerySafetyGuard } from '@/features/ai/QuerySafetyGuard';
import { Button } from '@/shared/ui/Button';
import { Database } from 'lucide-react';
import { getQuestionsForDb } from '@/data/index';

import { usePracticeState } from '@/features/practice/hooks/usePracticeState';
import { usePracticeLayout } from '@/features/practice/hooks/usePracticeLayout';
import { PracticeHeader } from '@/features/practice/PracticeHeader';
import { PracticeWorkspace } from '@/features/practice/PracticeWorkspace';
import { PracticeModals } from '@/features/practice/PracticeModals';

import { SchemaSidebar } from '@/features/practice/SchemaSidebar';
import { QuestionCard } from '@/features/practice/QuestionCard';
import { DiscussionsPanel } from '@/features/practice/DiscussionsPanel';
import { DB_INFO } from '@/data/schemas';
import { loadShortcuts, isShortcutMatch } from '@/utils/shortcutManager';

const SqlEditor = lazy(() => import('@/features/practice/SqlEditor').then((m) => ({ default: m.SqlEditor })));
const ResultsPanel = lazy(() => import('@/features/practice/ResultsPanel').then((m) => ({ default: m.ResultsPanel })));
const ERDiagramModal = lazy(() => import('@/features/visualizers/InteractiveERDiagram').then((m) => ({ default: m.InteractiveERDiagram })));
const TablePreviewModal = lazy(() => import('@/features/visualizers/TablePreviewModal').then((m) => ({ default: m.TablePreviewModal })));
const AnimatedJoinVisualizer = lazy(() => import('@/features/visualizers/AnimatedJoinVisualizer').then((m) => ({ default: m.AnimatedJoinVisualizer })));
const CteConverterModal = lazy(() => import('@/features/visualizers/CteConverterModal').then((m) => ({ default: m.CteConverterModal })));

export function PracticeView({ onShowAuth, onProgressUpdate, onShowSettings, routeDb }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, progressLoaded } = useProgressStore();
  const { settings, toggleDarkMode } = useSettingsStore();
  const { toast } = useToast();
  const { fireConfetti } = useConfetti();
  const { checkSafety } = useQuerySafetyGuard();

  const state = usePracticeState({
    routeDb,
    progress,
    progressLoaded,
    settings,
    onProgressUpdate,
    user,
    onShowAuth,
    checkSafety,
    fireConfetti,
    toast,
    useSqlDatabase
  });

  const layout = usePracticeLayout();

  // Handle global shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const shortcuts = loadShortcuts();
      if (isShortcutMatch(e, shortcuts.runQuery)) {
        e.preventDefault();
        state.handleRun();
      }
      if (isShortcutMatch(e, shortcuts.formatSql)) {
        e.preventDefault();
        // format is handled internally in editor/workspace, we can pass a format trigger if needed
      }
      if (isShortcutMatch(e, shortcuts.toggleSidebar)) {
        e.preventDefault();
        layout.toggleSidebar();
      }
      if (isShortcutMatch(e, shortcuts.nextQuestion)) {
        e.preventDefault();
        state.handleNavigate('next');
      }
      if (isShortcutMatch(e, shortcuts.prevQuestion)) {
        e.preventDefault();
        state.handleNavigate('prev');
      }
      if (isShortcutMatch(e, shortcuts.toggleDarkMode)) {
        e.preventDefault();
        toggleDarkMode();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state, layout, toggleDarkMode]);

  // Global event listeners (open-join-analysis etc)
  useEffect(() => {
    const handleOpenJoinAnalysis = (e) => state.setJoinAnalysisData(e.detail);
    const handleOpenERDiagram = () => state.setShowERDiagram(true);
    window.addEventListener('open-join-analysis', handleOpenJoinAnalysis);
    window.addEventListener('open-er-diagram', handleOpenERDiagram);
    return () => {
      window.removeEventListener('open-join-analysis', handleOpenJoinAnalysis);
      window.removeEventListener('open-er-diagram', handleOpenERDiagram);
    };
  }, [state]);

  const dbInfo = DB_INFO[state.db];
  const fontSizeClass =
    settings.editorFontSize === 16 ? 'text-base' :
    settings.editorFontSize === 18 ? 'text-lg' : 'text-sm';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden bg-bg text-text selection:bg-primary/20 ${settings.darkMode ? 'dark' : ''}`}
      data-font-size={fontSizeClass}
    >
      <Helmet>
        <title>{dbInfo?.label ? `Practice ${dbInfo.label} SQL | DataDesk` : 'SQL Practice | DataDesk'}</title>
      </Helmet>

      {/* MOBILE WARNING OVERLAY REMOVED FOR RESPONSIVENESS */}

      <PracticeHeader
        db={state.db}
        dbInfo={dbInfo}
        progress={progress}
        showDbPicker={state.showDbPicker}
        setShowDbPicker={state.setShowDbPicker}
        handleSwitchDb={state.handleSwitchDb}
        resetDb={() => {}} // TODO implement resetDb if needed from store
        rightPanelOpen={layout.rightPanelOpen}
        setRightPanelOpen={layout.setRightPanelOpen}
        activeLeftPane={layout.activeLeftPane}
        setActiveLeftPane={layout.setActiveLeftPane}
        setShowERDiagram={state.setShowERDiagram}
        sidebarOpen={layout.sidebarOpen}
        toggleSidebar={layout.toggleSidebar}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
      />

      {state.isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-3 border-surface-3 border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-sm font-semibold text-text-secondary animate-pulse">Initializing Database...</p>
        </div>
      )}

      <main 
        ref={layout.layoutRef}
        className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0 relative bg-surface-2"
      >
        {/* LEFT PANE */}
        <div 
          className="shrink-0 border-r border-border bg-bg flex flex-col overflow-hidden transition-all duration-300 w-full md:w-[var(--desktop-w,auto)] h-[600px] md:h-full"
          style={layout.rightPanelOpen ? { '--desktop-w': `${layout.questionW}px` } : { display: 'none' }}
        >
          {layout.activeLeftPane === 'problem' ? (
            <QuestionCard
              question={state.currentQ}
              expectedResult={state.expectedResult}
              status={progress[state.currentQ?.id]}
              onNavigate={state.handleNavigate}
              hasPrev={getQuestionsForDb(state.db).findIndex(q => q.id === state.currentQ?.id) > 0}
              hasNext={getQuestionsForDb(state.db).findIndex(q => q.id === state.currentQ?.id) < getQuestionsForDb(state.db).length - 1}
              questionNumber={getQuestionsForDb(state.db).findIndex(q => q.id === state.currentQ?.id) + 1}
              totalQuestions={getQuestionsForDb(state.db).length}
              timedChallenges={settings.timedChallenges}
              onTimerExpire={() => toast({ title: "Time's up!", type: 'warning' })}
              onOpenBrowser={() => state.setShowBrowser(true)}
              onOpenAiTutor={() => state.setShowAiTutor(true)}
              currentSql={state.sql}
              lastValidation={state.validation}
              dbSchemaContext={state.dbSchemaContext}
              executeQuery={state.executeQuery}
            />
          ) : (
            <DiscussionsPanel questionId={state.currentQ?.id} user={user} onShowAuth={onShowAuth} />
          )}
        </div>

        {layout.rightPanelOpen && (
          <div
            onMouseDown={(e) => layout.handleMouseDown(e, 'left')}
            className="hidden md:block w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
          />
        )}

        <PracticeWorkspace
          workspaceRef={layout.workspaceRef}
          editorHeightPct={layout.editorHeightPct}
          sql={state.sql}
          setSql={state.setSql}
          runQuery={state.handleRun}
          isRunning={state.isExecuting}
          db={state.db}
          settings={settings}
          currentQ={state.currentQ}
          setShowCteModal={state.setShowCteModal}
          setJoinAnalysisData={state.setJoinAnalysisData}
          executeQuery={state.executeQuery}
          handleMouseDown={layout.handleMouseDown}
          result={state.result}
          validation={state.validation}
          SqlEditor={SqlEditor}
          ResultsPanel={ResultsPanel}
          showOverflow={layout.showOverflow}
          setShowOverflow={layout.setShowOverflow}
          queryHistory={state.queryHistory}
          navigate={navigate}
        />

        {layout.sidebarOpen && (
          <div
            onMouseDown={(e) => layout.handleMouseDown(e, 'right')}
            className="hidden md:block w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
          />
        )}

        <div 
          className="shrink-0 border-l border-border bg-surface transition-all duration-300 relative w-full md:w-[var(--desktop-w,auto)] h-[500px] md:h-full"
          style={layout.sidebarOpen ? { '--desktop-w': `${layout.schemaW}px` } : { display: 'none' }}
        >
          {layout.sidebarOpen && (
            <div className="w-full h-full overflow-hidden">
              <SchemaSidebar
                dbName={state.db}
                executeQuery={state.executeQuery}
                onPreviewTable={(tbl) => state.setPreviewTableName(tbl)}
                onClose={layout.toggleSidebar}
              />
            </div>
          )}
        </div>
      </main>

      <PracticeModals
        showERDiagram={state.showERDiagram}
        setShowERDiagram={state.setShowERDiagram}
        db={state.db}
        previewTableName={state.previewTableName}
        setPreviewTableName={state.setPreviewTableName}
        showCteModal={state.showCteModal}
        setShowCteModal={state.setShowCteModal}
        sql={state.sql}
        setSql={state.setSql}
        joinAnalysisData={state.joinAnalysisData}
        setJoinAnalysisData={state.setJoinAnalysisData}
        ERDiagramModal={ERDiagramModal}
        TablePreviewModal={TablePreviewModal}
        CteConverterModal={CteConverterModal}
        AnimatedJoinVisualizer={AnimatedJoinVisualizer}
      />
    </div>
  );
}

export default function PracticePage(props) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <div className="w-12 h-12 border-4 border-surface-3 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PracticeView {...props} />
    </Suspense>
  );
}
