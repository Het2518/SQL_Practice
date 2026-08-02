import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';

export function UserGuide({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'editor-features', label: 'SQL Editor & Hotkeys' },
    { id: 'schema-data', label: 'Schema & Data Explorer' },
    { id: 'execution-results', label: 'Results & Visualizations' },
    { id: 'practice-mode', label: 'Practice Mode & AI Tools' },
    { id: 'interview-prep', label: 'Interview Preparation' },
    { id: 'custom-datasets', label: 'Custom Datasets' },
    { id: 'profile-settings', label: 'Profile & Gamification' },
    { id: 'faq', label: 'FAQ & Troubleshooting' },
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
        <aside className="w-[280px] border-r border-border px-5 py-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-bold">
            Documentation
          </h3>
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left px-3 py-2 rounded-md border-none cursor-pointer text-sm transition-all duration-200 ${
                  activeSection === s.id
                    ? 'bg-primary-muted text-primary font-semibold'
                    : 'bg-transparent text-text font-normal hover:bg-surface-2'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-[60px] py-[40px] max-w-[900px] flex flex-col gap-[60px]">
          <section id="getting-started">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Getting Started
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base m-0">
              Welcome to DataDesk! Whether you're preparing for technical interviews, learning SQL
              from scratch, or refining advanced performance-tuning skills, this platform provides a
              100% local, ultra-fast environment coupled with powerful AI tools.
            </p>
            <div className="bg-surface-2 p-5 rounded-lg border border-border mt-5">
              <h4 className="m-0 mb-2 text-text text-base">Core Architecture</h4>
              <p className="m-0 text-text-secondary text-sm leading-relaxed">
                This application is powered by <strong>WASM SQLite</strong>. All pre-loaded
                databases execute entirely inside your browser's memory. This guarantees zero
                latency, complete privacy, and offline execution capabilities. Your personal
                progress, however, is securely backed by Supabase in the cloud so you never lose
                your data across devices.
              </p>
            </div>
          </section>

          <section id="editor-features">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              SQL Editor & Hotkeys
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base mb-5 m-0">
              The core of the platform is the embedded Monaco Editor (the same engine powering VS
              Code). It supports deep syntax highlighting, smart autocomplete (incorporating the
              live schema of your selected database), and intelligent formatting.
            </p>

            <h3 className="text-lg my-6 mb-3 text-text font-bold">Essential Buttons</h3>
            <ul className="pl-5 text-text-secondary leading-[1.7] m-0">
              <li>
                <strong>Run (▶)</strong>: Executes your query. Automatically protects against
                massive DOM payloads via pagination.
              </li>
              <li>
                <strong>Format (🪄)</strong>: Cleans up your messy SQL into a highly readable,
                standardized format.
              </li>
              <li>
                <strong>CTE Converter</strong>: Automatically converts nested subqueries in your
                code into clean, modern Common Table Expressions (<code>WITH</code> clauses).
              </li>
            </ul>

            <h3 className="text-lg my-6 mb-3 text-text font-bold">Global Keyboard Shortcuts</h3>
            <table className="w-full border-collapse text-left text-sm text-text-secondary">
              <thead>
                <tr className="border-b-2 border-border text-text">
                  <th className="p-3 font-semibold">Action</th>
                  <th className="p-3 font-semibold">Windows/Linux</th>
                  <th className="p-3 font-semibold">Mac</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">Execute Query</td>
                  <td className="p-3">
                    <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                  </td>
                  <td className="p-3">
                    <kbd>Cmd</kbd> + <kbd>Enter</kbd>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Format Code</td>
                  <td className="p-3">
                    <kbd>Ctrl</kbd> + <kbd>Q</kbd>
                  </td>
                  <td className="p-3">
                    <kbd>Cmd</kbd> + <kbd>Q</kbd>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Explain Query</td>
                  <td className="p-3">
                    <kbd>Ctrl</kbd> + <kbd>E</kbd>
                  </td>
                  <td className="p-3">
                    <kbd>Cmd</kbd> + <kbd>E</kbd>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Toggle Sidebars</td>
                  <td className="p-3">
                    <kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>`</kbd>
                  </td>
                  <td className="p-3">
                    <kbd>Cmd</kbd> + <kbd>B</kbd> / <kbd>`</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="schema-data">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Schema & Data Explorer
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base mb-3">
              The Schema Sidebar is your database explorer. It intelligently parses the live
              database to show you tables, columns, data types, and primary/foreign key
              relationships.
            </p>
            <ul className="pl-5 text-text-secondary leading-[1.7] mt-3 m-0">
              <li>
                <strong>Interactive ER Diagram:</strong> Click the "View ER Diagram" button at the
                bottom of the sidebar to see a visual, node-based graph of how all tables in the
                current database connect to each other. It features an automatic layout with fully
                interactive zoom and pan functionality!
              </li>
              <li>
                <strong>Table Preview:</strong> Hover over any table name in the sidebar and click
                the <strong>Eye Icon (👁️)</strong>. This opens a massive, full-screen Data Preview
                modal. It shows the exact schema definitions, column constraints (like{' '}
                <code>Nullable</code>), and a paginated view of up to 50,000 real records.
              </li>
            </ul>
          </section>

          <section id="execution-results">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Results & Visualizations
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base mb-3">
              When you hit Run, the Results Panel springs to life. It handles massive result sets
              flawlessly using built-in pagination. This platform isn't just an executor; it's a
              teacher with advanced visualizers.
            </p>
            <ul className="pl-5 text-text-secondary leading-[1.7] mt-3 m-0">
              <li>
                <strong>Sleek Pagination:</strong> Pinned to the bottom of the results table, you'll
                find navigation arrows and a metric showing exactly what slice of data you're
                viewing.
              </li>
              <li>
                <strong>Null Highlighting:</strong> Any <code>NULL</code> values returned by your
                query are explicitly styled in italics with a faded background, preventing confusion
                between empty strings and nulls.
              </li>
            </ul>

            <div className="grid gap-4 mt-5">
              <div className="p-4 bg-surface-2 border border-border rounded-lg">
                <h4 className="m-0 mb-2 text-text flex items-center gap-2">
                  🔍 Execution Explainer (Ctrl+E)
                </h4>
                <p className="m-0 text-sm text-text-secondary leading-relaxed">
                  Generates a step-by-step breakdown of how the database engine parses your query
                  (FROM → WHERE → GROUP BY → SELECT). It also hooks into SQLite's native{' '}
                  <code>EXPLAIN QUERY PLAN</code>.
                </p>
              </div>
              <div className="p-4 bg-surface-2 border border-border rounded-lg">
                <h4 className="m-0 mb-2 text-text flex items-center gap-2">
                  🔗 Animated Join Visualizer
                </h4>
                <p className="m-0 text-sm text-text-secondary leading-relaxed">
                  If your query contains JOINs, clicking this tool in the results panel will draw an
                  animated visualization showing exactly how INNER, LEFT, or FULL joins operated on
                  your specific tables.
                </p>
              </div>
              <div className="p-4 bg-surface-2 border border-border rounded-lg">
                <h4 className="m-0 mb-2 text-text flex items-center gap-2">
                  ⚡ Index Advisor
                </h4>
                <p className="m-0 text-sm text-text-secondary leading-relaxed">
                  Analyzes your <code>WHERE</code> and <code>JOIN</code> clauses and recommends
                  specific <code>CREATE INDEX</code> statements to speed up your query on massive
                  datasets.
                </p>
              </div>
            </div>
          </section>

          <section id="practice-mode">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Practice Mode & AI Tools
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base m-0">
              Our practice environment offers hundreds of questions spanning various difficulty
              levels and schemas, supercharged with new AI capabilities.
            </p>
            <ul className="pl-5 text-text-secondary leading-[1.7] mt-3 m-0">
              <li>
                <strong>Advanced Question Browser:</strong> Filter tasks by difficulty, topic
                (Joins, CTEs, Window Functions), and schema. Completing tasks automatically marks
                them as solved in your profile.
              </li>
              <li>
                <strong>AI Hint Panel:</strong> Stuck on a hard query? Click the{' '}
                <strong>Get Hint</strong> button. Our new AI-powered Hint Panel provides
                personalized, progressive conceptual feedback without giving away the answer.
              </li>
              <li>
                <strong>AI Solution Review:</strong> After you solve a problem, our AI will review
                your code and suggest more optimal, cleaner, or more standard approaches.
              </li>
              <li>
                <strong>Diff Table Validation:</strong> When you submit an answer, the platform runs
                your query alongside a hidden Master Solution, generating a{' '}
                <strong>Diff Table</strong> highlighting missing rows, extra rows, or mismatched
                columns.
              </li>
            </ul>
          </section>

          <section id="interview-prep">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Interview Preparation
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base m-0">
              DataDesk now features a dedicated Premium Interview Dashboard specifically tailored to
              get you hired.
            </p>
            <ul
              style={{
                paddingLeft: 20,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginTop: 12,
              }}
            >
              <li>
                <strong>Company-Specific Prep:</strong> View specialized pages for companies (like
                Amazon, Meta, Stripe) which contain difficulty distributions, frequent topics, and
                real interview experiences reported by candidates.
              </li>
              <li>
                <strong>Learning Paths:</strong> Each company has a custom roadmap to master exactly
                what they test for in their SQL interviews.
              </li>
              <li>
                <strong>Mock Interviews:</strong> Jump into a timed mock interview containing the
                most frequent questions from your selected company.
              </li>
            </ul>
          </section>

          <section id="custom-datasets">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Custom Datasets
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base m-0">
              Want to practice on your own data? Head to the Custom Dataset page.
            </p>
            <ul
              style={{
                paddingLeft: 20,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginTop: 12,
              }}
            >
              <li>Upload one or more CSV files simultaneously.</li>
              <li>
                The platform will automatically parse the headers, infer data types (Integer, Text,
                Real), and spawn a brand new ephemeral SQLite database in memory.
              </li>
              <li>You can immediately write complex SQL against your own spreadsheets.</li>
            </ul>
          </section>

          <section id="profile-settings">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              Profile & Gamification
            </h2>
            <p className="leading-[1.7] text-text-secondary text-base m-0">
              The platform tracks your growth as a SQL developer and rewards your consistency.
            </p>
            <ul
              style={{
                paddingLeft: 20,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginTop: 12,
              }}
            >
              <li>
                <strong>Developer Profile:</strong> Accessible via the top navigation, this
                dashboard tracks your total queries executed, questions solved, and current streak.
                It visualizes your progress via a GitHub-style contribution heatmap and a radar
                chart of your skills.
              </li>
              <li>
                <strong>Gamification & Badges:</strong> Earn badges for hitting milestones (like 50
                questions solved, 7-day streak) and level up your global rank. All progress is
                persisted securely to the cloud via Supabase.
              </li>
              <li>
                <strong>Settings Modal (⚙️):</strong> Customize your experience. Change the editor
                theme (Dark/Light), adjust font sizes, change pagination limits, and manage your AI
                API keys.
              </li>
            </ul>
          </section>

          <section id="faq">
            <h2 className="text-[28px] mb-4 text-text font-extrabold">
              FAQ & Troubleshooting
            </h2>

            <div className="flex flex-col gap-6 mt-5">
              <div className="pb-5 border-b border-border">
                <h4 className="m-0 mb-2 text-base text-text">
                  Why did my browser freeze on a massive query?
                </h4>
                <p className="m-0 text-text-secondary text-[15px] leading-[1.6]">
                  If you write <code>SELECT * FROM huge_table</code> without a limit, returning
                  50,000+ rows used to crash the DOM. However, our new pagination engine safely
                  captures these massive arrays and strictly renders only 50 rows at a time, keeping
                  your browser lightning fast!
                </p>
              </div>

              <div className="pb-5 border-b border-border">
                <h4 className="m-0 mb-2 text-base text-text">
                  Does this platform support stored procedures or triggers?
                </h4>
                <p className="m-0 text-text-secondary text-[15px] leading-[1.6]">
                  Because the backend runs on SQLite, it fully supports Triggers, Views, and CTEs.
                  However, SQLite does not natively support complex Stored Procedures (T-SQL or
                  PL/pgSQL). Stick to standard ANSI SQL.
                </p>
              </div>

              <div className="pb-5 border-b border-border">
                <h4 className="m-0 mb-2 text-base text-text">
                  How is my progress saved?
                </h4>
                <p className="m-0 text-text-secondary text-[15px] leading-[1.6]">
                  Your user profile, solved questions, and settings are safely backed by Supabase
                  cloud storage, allowing for seamless progress persistence across devices.
                </p>
              </div>

              <div className="pb-5 border-b border-border">
                <h4 className="m-0 mb-2 text-base text-text">
                  How do the new AI features work?
                </h4>
                <p className="m-0 text-text-secondary text-[15px] leading-[1.6]">
                  The AI Hint Panel and Solution Review utilize the Groq API for lightning-fast
                  inference. You can configure your Groq API key securely within the Settings Modal.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
