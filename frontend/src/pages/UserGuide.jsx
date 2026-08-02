import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { BookOpen, Code2, Database, ShieldAlert, Target, PlayCircle, Trophy, Bot, Star, TerminalSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function UserGuide({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: '1. Getting Started', icon: <PlayCircle size={16} /> },
    { id: 'editor-features', label: '2. SQL Editor & Hotkeys', icon: <TerminalSquare size={16} /> },
    { id: 'schema-data', label: '3. Schema & Data Explorer', icon: <Database size={16} /> },
    { id: 'execution-results', label: '4. Visualizers & execution', icon: <Code2 size={16} /> },
    { id: 'practice-mode', label: '5. Practice Mode & AI Tutor', icon: <Bot size={16} /> },
    { id: 'interview-prep', label: '6. FAANG Mock Interviews', icon: <ShieldAlert size={16} /> },
    { id: 'custom-datasets', label: '7. Custom Datasets Sandbox', icon: <Target size={16} /> },
    { id: 'profile-settings', label: '8. Profile & Gamification', icon: <Trophy size={16} /> },
    { id: 'faq', label: '9. FAQ & Troubleshooting', icon: <Star size={16} /> },
  ];

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text flex flex-col page-enter">
      {/* ── Global Header ── */}
      <Header
        user={user}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: () => navigate('/') }, { label: 'Documentation' }]}
          />
        }
      />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Table of Contents Sidebar */}
        <aside className="w-[300px] border-r border-border px-5 py-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto hidden md:block bg-surface/50">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-6 font-black flex items-center gap-2">
            <BookOpen size={14} /> Official Documentation
          </h3>
          <nav className="flex flex-col gap-1.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`text-left px-3 py-2.5 rounded-lg border-none cursor-pointer text-sm transition-all duration-200 flex items-center gap-3 ${
                  activeSection === s.id
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text hover:bg-surface-2'
                }`}
              >
                <span className={activeSection === s.id ? 'text-primary' : 'opacity-60'}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-10 md:px-12 md:py-12 max-w-[900px] flex flex-col gap-16">
          <section id="getting-started" className="scroll-mt-24">
            <h1 className="text-4xl mb-6 text-text font-black tracking-tight">
              Welcome to DataDesk
            </h1>
            <p className="leading-loose text-text-secondary text-lg m-0">
              DataDesk is an enterprise-grade SQL practice and interview preparation platform built natively for the web. Whether you are preparing for a brutal FAANG technical screen, learning SQL from scratch, or refining advanced performance-tuning skills, DataDesk provides a 100% local, ultra-fast environment coupled with powerful AI tools.
            </p>
            <div className="bg-surface-2 p-6 rounded-2xl border border-border mt-8 shadow-inner">
              <h4 className="m-0 mb-3 text-text text-lg font-bold flex items-center gap-2">
                <Database className="text-primary" /> Core Architecture: WASM SQLite
              </h4>
              <p className="m-0 text-text-secondary text-base leading-relaxed">
                This platform is powered by <strong>WASM SQLite</strong>. All queries you write execute entirely inside your browser's local memory. This guarantees zero latency, complete privacy, and full offline execution capabilities. Your gamification progress and solved questions are securely backed by Supabase in the cloud.
              </p>
            </div>
          </section>

          <section id="editor-features" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <TerminalSquare className="text-primary" /> SQL Editor & Hotkeys
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6 m-0">
              The core of the platform is the embedded Monaco Editor (the same engine powering VS Code). It supports deep syntax highlighting, smart autocomplete (incorporating the live schema of your selected database), and intelligent formatting.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-surface border border-border p-5 rounded-xl">
                <strong className="block mb-2 text-text">Run (▶)</strong>
                <span className="text-sm text-text-secondary">Executes your query instantly. Handles massive DOM payloads natively via virtual pagination.</span>
              </div>
              <div className="bg-surface border border-border p-5 rounded-xl">
                <strong className="block mb-2 text-text">Format (🪄)</strong>
                <span className="text-sm text-text-secondary">Cleans up your messy SQL into a highly readable, standardized layout using SQL-Formatter.</span>
              </div>
              <div className="bg-surface border border-border p-5 rounded-xl">
                <strong className="block mb-2 text-text">CTE Converter</strong>
                <span className="text-sm text-text-secondary">Automatically converts nasty nested subqueries in your code into clean, modern Common Table Expressions (WITH clauses).</span>
              </div>
            </div>

            <h3 className="text-xl my-6 mb-4 text-text font-bold">Global Keyboard Shortcuts</h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-sm text-text-secondary bg-surface">
                <thead>
                  <tr className="border-b-2 border-border text-text bg-surface-2">
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold">Windows / Linux</th>
                    <th className="p-4 font-semibold">Mac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4">Execute Query</td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Ctrl + Enter</kbd></td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Cmd + Enter</kbd></td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4">Format Code</td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Shift + Alt + F</kbd></td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Shift + Option + F</kbd></td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4">Explain Query</td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Ctrl + E</kbd></td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Cmd + E</kbd></td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4">Toggle Sidebars</td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Ctrl + B</kbd></td>
                    <td className="p-4"><kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Cmd + B</kbd></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="schema-data" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <Database className="text-primary" /> Schema & Data Explorer
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6">
              The Schema Sidebar is your database explorer. It intelligently parses the live database to show you tables, columns, data types, and primary/foreign key relationships.
            </p>
            <div className="space-y-4 text-text-secondary leading-loose">
              <div className="p-5 bg-surface rounded-xl border border-border flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-text block mb-1">Interactive ER Diagram</strong>
                  Click the "View ER Diagram" button at the bottom of the sidebar to see a visual, node-based graph of how all tables connect. It features fully interactive zoom and pan functionality, helping you understand complex schemas instantly.
                </div>
              </div>
              <div className="p-5 bg-surface rounded-xl border border-border flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-text block mb-1">Live Table Preview</strong>
                  Hover over any table name in the sidebar and click the <strong>Eye Icon (👁️)</strong>. This opens a full-screen Data Preview modal showing schema definitions, constraints, and a paginated view of up to 50,000 real records.
                </div>
              </div>
            </div>
          </section>

          <section id="execution-results" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <Code2 className="text-primary" /> Results & Visualizations
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6">
              When you hit Run, the Results Panel springs to life. This platform isn't just an executor; it's a teacher equipped with advanced analytical visualizers.
            </p>
            
            <div className="grid gap-6 mt-6">
              <div className="p-6 bg-surface-2 border border-border rounded-xl hover:border-primary/50 transition-colors">
                <h4 className="m-0 mb-3 text-text flex items-center gap-2 text-lg font-bold">
                  🔍 Execution Explainer (Ctrl+E)
                </h4>
                <p className="m-0 text-base text-text-secondary leading-relaxed">
                  Generates a step-by-step breakdown of how the database engine parses your query (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY). It also automatically hooks into SQLite's native <code>EXPLAIN QUERY PLAN</code> to show you B-Tree usage and table scans.
                </p>
              </div>
              <div className="p-6 bg-surface-2 border border-border rounded-xl hover:border-primary/50 transition-colors">
                <h4 className="m-0 mb-3 text-text flex items-center gap-2 text-lg font-bold">
                  🔗 Animated Join Visualizer
                </h4>
                <p className="m-0 text-base text-text-secondary leading-relaxed">
                  If your query contains JOINs, clicking the Visualizer tool in the results panel will draw an animated Venn-diagram style visualization showing exactly how INNER, LEFT, or FULL joins operated on your specific tables.
                </p>
              </div>
              <div className="p-6 bg-surface-2 border border-border rounded-xl hover:border-primary/50 transition-colors">
                <h4 className="m-0 mb-3 text-text flex items-center gap-2 text-lg font-bold">
                  ⚡ Index Advisor
                </h4>
                <p className="m-0 text-base text-text-secondary leading-relaxed">
                  Analyzes your <code>WHERE</code> and <code>JOIN</code> clauses and proactively recommends specific <code>CREATE INDEX</code> statements to speed up your query on massive datasets.
                </p>
              </div>
            </div>
          </section>

          <section id="practice-mode" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <Bot className="text-primary" /> Practice Mode & AI Tutor
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6">
              Our practice environment offers hundreds of questions spanning various difficulty levels and schemas, supercharged with cutting-edge AI capabilities.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success mt-1 shrink-0" />
                <div>
                  <strong className="text-text block mb-1">Proactive Background Tutor (Agent 3)</strong>
                  <span className="text-text-secondary">If you are stuck on a query for 30 seconds of inactivity, a background AI silently analyzes your code. If you make a critical syntax or logic mistake, it slides a gentle, non-obtrusive hint onto your screen automatically.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success mt-1 shrink-0" />
                <div>
                  <strong className="text-text block mb-1">Diff Table Validation</strong>
                  <span className="text-text-secondary">When you submit an answer, the platform runs your query alongside a hidden Master Solution, generating a <strong>Diff Table</strong> highlighting missing rows, extra rows, or mismatched columns in red/green to help you debug instantly.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success mt-1 shrink-0" />
                <div>
                  <strong className="text-text block mb-1">AI Solution Review & Hint Panel</strong>
                  <span className="text-text-secondary">Stuck? Click "Get Hint" for progressive conceptual feedback. Finished? The AI will review your code and suggest more optimal, cleaner, or standard approaches.</span>
                </div>
              </li>
            </ul>
          </section>

          <section id="interview-prep" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <ShieldAlert className="text-primary" /> FAANG Mock Interviews
            </h2>
            <div className="bg-error/10 border border-error/20 p-6 rounded-2xl mb-8">
              <h3 className="text-error font-black text-xl mb-2 flex items-center gap-2">
                <AlertTriangle /> Zero-Tolerance Proctoring
              </h3>
              <p className="text-error/90 leading-relaxed mb-4">
                The Interview Arena is designed to perfectly simulate a high-stress FAANG technical screen. It utilizes a strict zero-tolerance integrity policy.
              </p>
              <ul className="list-disc pl-5 text-error/80 space-y-1 text-sm">
                <li>Pre-flight verification mandates a Camera, Microphone, and Screen-share check.</li>
                <li>Exiting Fullscreen instantly terminates the interview.</li>
                <li>Switching Tabs or Window Blurring (Alt-Tab) triggers an instant failure.</li>
                <li>Copy/Paste and Developer Tools are strictly disabled.</li>
              </ul>
            </div>
            
            <p className="leading-loose text-text-secondary text-base mb-6">
              During the interview, an elite AI Principal Engineer administers a dynamic problem. You have a Scratchpad tab for notes, and the editor tracks your history. 
              The session automatically saves to local storage every 5 seconds—if your browser crashes, simply return to the arena to instantly resume your session.
            </p>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/interview')} variant="primary">
                Enter Interview Lobby
              </Button>
            </div>
          </section>

          <section id="custom-datasets" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <Target className="text-primary" /> Custom Datasets Sandbox
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6">
              Want to practice on your own data? Head to the Custom Dataset page to instantiate an ephemeral local sandbox.
            </p>
            <div className="bg-surface p-6 rounded-xl border border-border">
              <ol className="list-decimal pl-5 text-text-secondary leading-loose space-y-2">
                <li>Upload one or more CSV files simultaneously.</li>
                <li>The platform will automatically parse the headers, deeply infer data types (Integer, Text, Real), and spawn a brand new SQLite database in memory.</li>
                <li>You can immediately write complex SQL against your own spreadsheets without uploading any data to a remote server.</li>
              </ol>
              <div className="mt-6">
                <Button onClick={() => navigate('/sandbox')} variant="outline" size="sm">
                  Try Custom Sandbox
                </Button>
              </div>
            </div>
          </section>

          <section id="profile-settings" className="scroll-mt-24">
            <h2 className="text-3xl mb-6 text-text font-extrabold flex items-center gap-3">
              <Trophy className="text-primary" /> Profile & Gamification
            </h2>
            <p className="leading-loose text-text-secondary text-base mb-6">
              The platform tracks your growth as a SQL developer and rewards your consistency through an extensive Gamification Engine.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="border border-border p-5 rounded-xl bg-surface-2">
                <h4 className="font-bold text-text mb-2">Developer Profile</h4>
                <p className="text-sm text-text-secondary">Visualizes your progress via a GitHub-style contribution heatmap and a dynamic radar chart of your SQL competencies (Joins, Aggregations, CTEs).</p>
              </div>
              <div className="border border-border p-5 rounded-xl bg-surface-2">
                <h4 className="font-bold text-text mb-2">Global Leaderboard</h4>
                <p className="text-sm text-text-secondary">Compete globally! Earn XP for solving challenges and maintaining a daily streak. Track your rank in real-time.</p>
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24">
            <h2 className="text-3xl mb-8 text-text font-extrabold flex items-center gap-3">
              <Star className="text-primary" /> FAQ & Troubleshooting
            </h2>

            <div className="flex flex-col gap-8">
              <div className="pb-6 border-b border-border">
                <h4 className="m-0 mb-3 text-lg font-bold text-text">
                  Why did my browser freeze on a massive query?
                </h4>
                <p className="m-0 text-text-secondary text-base leading-loose">
                  If you write <code>SELECT * FROM huge_table</code> without a limit, returning 50,000+ rows used to crash the DOM. However, our new Virtual Pagination engine safely captures these massive arrays and strictly renders only 50 rows at a time, keeping your browser lightning fast regardless of the result size!
                </p>
              </div>

              <div className="pb-6 border-b border-border">
                <h4 className="m-0 mb-3 text-lg font-bold text-text">
                  Does this platform support stored procedures or triggers?
                </h4>
                <p className="m-0 text-text-secondary text-base leading-loose">
                  Because the backend runs natively on SQLite, it fully supports Triggers, Views, and CTEs. However, SQLite does not natively support complex Stored Procedures (like T-SQL or PL/pgSQL). Please stick to standard ANSI SQL.
                </p>
              </div>

              <div className="pb-6 border-b border-border">
                <h4 className="m-0 mb-3 text-lg font-bold text-text">
                  How is my data securely saved?
                </h4>
                <p className="m-0 text-text-secondary text-base leading-loose">
                  Your execution runs locally, but your user profile, solved questions, and XP are safely backed by Supabase cloud storage, allowing for seamless progress persistence across any device. Interview sessions use LocalStorage for instant crash recovery.
                </p>
              </div>

              <div className="pb-6">
                <h4 className="m-0 mb-3 text-lg font-bold text-text">
                  How do the new AI features work without a backend?
                </h4>
                <p className="m-0 text-text-secondary text-base leading-loose">
                  The AI Hint Panel, Interviewer, and Proactive Tutor utilize the Groq API for lightning-fast inference directly from the client. You can configure your Groq API key securely within the Settings Modal (it is stored in Ephemeral Session Storage to prevent XSS leaks).
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
