import React from 'react';
import { ChevronDown, List, Network, Database } from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { getQuestionsForDb } from '@/data/index';
import { Header } from '@/shared/ui/Header';

export const PracticeHeader = React.memo(function PracticeHeader({
  db,
  dbInfo,
  progress,
  showDbPicker,
  setShowDbPicker,
  handleSwitchDb,
  resetDb,
  rightPanelOpen,
  setRightPanelOpen,
  activeLeftPane,
  setActiveLeftPane,
  setShowERDiagram,
  sidebarOpen,
  toggleSidebar,
  onShowAuth,
  onShowSettings,
}) {
  return (
    <Header
      onShowAuth={onShowAuth}
      onShowSettings={onShowSettings}
      leftContent={
        <div
          className="relative flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowDbPicker((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-2 py-1 bg-transparent border-none cursor-pointer text-text rounded-md transition-colors hover:bg-surface-2"
          >
            {dbInfo?.label || db} <ChevronDown size={14} className="opacity-50" />
          </button>
          {showDbPicker && (
            <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-surface border border-border rounded-xl shadow-float min-w-[230px] py-1.5">
              <div className="px-3.5 pt-1.5 pb-1.5 text-[10px] font-bold text-muted uppercase tracking-[1px]">
                Switch Database
              </div>
              {Object.keys(DB_INFO).map((d) => {
                const info = DB_INFO[d];
                const dbQs = getQuestionsForDb(d);
                const comp = dbQs.filter((q) => progress[q.id] === 'complete').length;
                const isActive = d === db;
                return (
                  <button
                    key={d}
                    onClick={() => handleSwitchDb(d)}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2 border-none cursor-pointer text-[13px] font-sans transition-colors ${
                      isActive ? 'bg-primary-muted font-semibold text-text' : 'bg-transparent font-normal text-text hover:bg-surface-2'
                    }`}
                  >
                    <span className="flex-1 text-left">
                      {info.label}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                      {comp}/{info.questionCount}
                    </span>
                    {isActive && (
                      <span className="text-text text-[11px] font-bold" aria-label="Active">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  if (window.confirm('Reset all progress for ' + (dbInfo?.label || db) + '?'))
                    resetDb(db);
                  setShowDbPicker(false);
                }}
                className="flex items-center w-full px-3.5 py-2 bg-transparent hover:bg-surface-2 border-none cursor-pointer text-error text-xs font-semibold transition-colors"
              >
                ↺ Reset Progress
              </button>
            </div>
          )}
        </div>
      }
      centerContent={
        <div className="relative flex items-center p-1 bg-surface-2 rounded-lg border border-border shadow-inner mx-4">
          <button
            onClick={() => {
              if (!rightPanelOpen) setRightPanelOpen(true);
              if (activeLeftPane === 'problem' && rightPanelOpen) {
                setRightPanelOpen(false);
              } else {
                setActiveLeftPane('problem');
              }
            }}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors rounded-md bg-transparent border-none ${rightPanelOpen && activeLeftPane === 'problem' ? 'text-text' : 'text-text-secondary hover:text-text'}`}
          >
            <List size={14} /> Description
          </button>
          <button
            onClick={() => {
              if (!rightPanelOpen) setRightPanelOpen(true);
              if (activeLeftPane === 'discussions' && rightPanelOpen) {
                setRightPanelOpen(false);
              } else {
                setActiveLeftPane('discussions');
              }
            }}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors rounded-md bg-transparent border-none ${rightPanelOpen && activeLeftPane === 'discussions' ? 'text-text' : 'text-text-secondary hover:text-text'}`}
          >
            Discussion
          </button>
          <div 
            className="absolute top-1 bottom-1 w-1/2 bg-surface border border-border rounded-md shadow-sm transition-transform duration-200 ease-in-out pointer-events-none" 
            style={{
              transform: rightPanelOpen 
                ? (activeLeftPane === 'problem' ? 'translateX(0)' : 'translateX(100%)')
                : 'scaleX(0)',
              opacity: rightPanelOpen ? 1 : 0
            }} 
          />
        </div>
      }
      navLinks={[]}
      rightContent={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowERDiagram(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer bg-surface-2 text-text-secondary border-border hover:text-text hover:bg-surface-3"
            title="View ER Diagram"
          >
            <Network size={13} />
            <span className="hidden sm:inline">ER Diagram</span>
          </button>
          <button
            onClick={() => toggleSidebar()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              sidebarOpen
                ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
                : 'bg-surface-2 text-text-secondary border-border hover:text-text hover:bg-surface-3'
            }`}
            title={sidebarOpen ? "Hide Database Schema & Tables" : "Open Database Schema & Tables"}
          >
            <Database size={13} className={sidebarOpen ? "text-primary" : "text-text-secondary"} />
            <span className="hidden sm:inline">Schema</span>
            <span className={`w-1.5 h-1.5 rounded-full ${sidebarOpen ? 'bg-primary' : 'bg-muted'}`} />
          </button>
        </div>
      }
    />
  );
});
