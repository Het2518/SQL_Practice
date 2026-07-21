import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';

export function UserGuide({ user, settings, onShowAuth, onShowSettings, onToggleDark }) {
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
    { id: 'faq', label: 'FAQ & Troubleshooting' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Global Header ── */}
      <Header
        user={user}
        settings={settings}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        onToggleDark={onToggleDark}
        leftContent={
          <HeaderBreadcrumbs 
            items={[
              { label: 'Home', onClick: () => navigate('/') }, 
              { label: 'Documentation' }
            ]} 
          />
        }
      />

      <div style={{ display: 'flex', flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        
        {/* Table of Contents Sidebar */}
        <aside style={{
          width: 280,
          borderRight: '1px solid var(--border)',
          padding: '32px 20px',
          position: 'sticky',
          top: 65,
          height: 'calc(100vh - 65px)',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 700 }}>
            Documentation
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: activeSection === s.id ? 'var(--primary-muted)' : 'transparent',
                  color: activeSection === s.id ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activeSection === s.id ? 600 : 400,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '40px 60px',
          maxWidth: 900,
          display: 'flex',
          flexDirection: 'column',
          gap: 60
        }}>
          
          <section id="getting-started">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Getting Started</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              Welcome to DataDesk! Whether you're preparing for technical interviews, learning SQL from scratch, or refining advanced performance-tuning skills, this platform provides a 100% local, ultra-fast environment coupled with powerful AI tools.
            </p>
            <div style={{ background: 'var(--surface-2)', padding: 20, borderRadius: 8, border: '1px solid var(--border)', marginTop: 20 }}>
              <h4 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Core Architecture</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                This application is powered by <strong>WASM SQLite</strong>. All pre-loaded databases execute entirely inside your browser's memory. This guarantees zero latency, complete privacy, and offline execution capabilities. Your personal progress, however, is securely backed by Supabase in the cloud so you never lose your data across devices.
              </p>
            </div>
          </section>

          <section id="editor-features">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>SQL Editor & Hotkeys</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16, marginBottom: 20 }}>
              The core of the platform is the embedded Monaco Editor (the same engine powering VS Code). It supports deep syntax highlighting, smart autocomplete (incorporating the live schema of your selected database), and intelligent formatting.
            </p>
            
            <h3 style={{ fontSize: 18, margin: '24px 0 12px' }}>Essential Buttons</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>Run (▶)</strong>: Executes your query. Automatically protects against massive DOM payloads via pagination.</li>
              <li><strong>Format (🪄)</strong>: Cleans up your messy SQL into a highly readable, standardized format.</li>
              <li><strong>CTE Converter</strong>: Automatically converts nested subqueries in your code into clean, modern Common Table Expressions (<code>WITH</code> clauses).</li>
            </ul>

            <h3 style={{ fontSize: 18, margin: '24px 0 12px' }}>Global Keyboard Shortcuts</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Windows/Linux</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Mac</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>Execute Query</td>
                  <td style={{ padding: '12px' }}><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td>
                  <td style={{ padding: '12px' }}><kbd>Cmd</kbd> + <kbd>Enter</kbd></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>Format Code</td>
                  <td style={{ padding: '12px' }}><kbd>Ctrl</kbd> + <kbd>Q</kbd></td>
                  <td style={{ padding: '12px' }}><kbd>Cmd</kbd> + <kbd>Q</kbd></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>Explain Query</td>
                  <td style={{ padding: '12px' }}><kbd>Ctrl</kbd> + <kbd>E</kbd></td>
                  <td style={{ padding: '12px' }}><kbd>Cmd</kbd> + <kbd>E</kbd></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>Toggle Sidebars</td>
                  <td style={{ padding: '12px' }}><kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>`</kbd></td>
                  <td style={{ padding: '12px' }}><kbd>Cmd</kbd> + <kbd>B</kbd> / <kbd>`</kbd></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="schema-data">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Schema & Data Explorer</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              The Schema Sidebar is your database explorer. It intelligently parses the live database to show you tables, columns, data types, and primary/foreign key relationships.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li><strong>Interactive ER Diagram:</strong> Click the "View ER Diagram" button at the bottom of the sidebar to see a visual, node-based graph of how all tables in the current database connect to each other. It features an automatic layout with fully interactive zoom and pan functionality!</li>
              <li><strong>Table Preview:</strong> Hover over any table name in the sidebar and click the <strong>Eye Icon (👁️)</strong>. This opens a massive, full-screen Data Preview modal. It shows the exact schema definitions, column constraints (like <code>Nullable</code>), and a paginated view of up to 50,000 real records.</li>
            </ul>
          </section>

          <section id="execution-results">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Results & Visualizations</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              When you hit Run, the Results Panel springs to life. It handles massive result sets flawlessly using built-in pagination. This platform isn't just an executor; it's a teacher with advanced visualizers.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li><strong>Sleek Pagination:</strong> Pinned to the bottom of the results table, you'll find navigation arrows and a metric showing exactly what slice of data you're viewing.</li>
              <li><strong>Null Highlighting:</strong> Any <code>NULL</code> values returned by your query are explicitly styled in italics with a faded background, preventing confusion between empty strings and nulls.</li>
            </ul>
            
            <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
              <div style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>🔍 Execution Explainer (Ctrl+E)</h4>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Generates a step-by-step breakdown of how the database engine parses your query (FROM → WHERE → GROUP BY → SELECT). It also hooks into SQLite's native <code>EXPLAIN QUERY PLAN</code>.</p>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>🔗 Animated Join Visualizer</h4>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>If your query contains JOINs, clicking this tool in the results panel will draw an animated visualization showing exactly how INNER, LEFT, or FULL joins operated on your specific tables.</p>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>⚡ Index Advisor</h4>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Analyzes your <code>WHERE</code> and <code>JOIN</code> clauses and recommends specific <code>CREATE INDEX</code> statements to speed up your query on massive datasets.</p>
              </div>
            </div>
          </section>

          <section id="practice-mode">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Practice Mode & AI Tools</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              Our practice environment offers hundreds of questions spanning various difficulty levels and schemas, supercharged with new AI capabilities.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li><strong>Advanced Question Browser:</strong> Filter tasks by difficulty, topic (Joins, CTEs, Window Functions), and schema. Completing tasks automatically marks them as solved in your profile.</li>
              <li><strong>AI Hint Panel:</strong> Stuck on a hard query? Click the <strong>Get Hint</strong> button. Our new AI-powered Hint Panel provides personalized, progressive conceptual feedback without giving away the answer.</li>
              <li><strong>AI Solution Review:</strong> After you solve a problem, our AI will review your code and suggest more optimal, cleaner, or more standard approaches.</li>
              <li><strong>Diff Table Validation:</strong> When you submit an answer, the platform runs your query alongside a hidden Master Solution, generating a <strong>Diff Table</strong> highlighting missing rows, extra rows, or mismatched columns.</li>
            </ul>
          </section>

          <section id="interview-prep">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Interview Preparation</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              DataDesk now features a dedicated Premium Interview Dashboard specifically tailored to get you hired.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li><strong>Company-Specific Prep:</strong> View specialized pages for companies (like Amazon, Meta, Stripe) which contain difficulty distributions, frequent topics, and real interview experiences reported by candidates.</li>
              <li><strong>Learning Paths:</strong> Each company has a custom roadmap to master exactly what they test for in their SQL interviews.</li>
              <li><strong>Mock Interviews:</strong> Jump into a timed mock interview containing the most frequent questions from your selected company.</li>
            </ul>
          </section>

          <section id="custom-datasets">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Custom Datasets</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              Want to practice on your own data? Head to the Custom Dataset page.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li>Upload one or more CSV files simultaneously.</li>
              <li>The platform will automatically parse the headers, infer data types (Integer, Text, Real), and spawn a brand new ephemeral SQLite database in memory.</li>
              <li>You can immediately write complex SQL against your own spreadsheets.</li>
            </ul>
          </section>

          <section id="profile-settings">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>Profile & Gamification</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 16 }}>
              The platform tracks your growth as a SQL developer and rewards your consistency.
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              <li><strong>Developer Profile:</strong> Accessible via the top navigation, this dashboard tracks your total queries executed, questions solved, and current streak. It visualizes your progress via a GitHub-style contribution heatmap and a radar chart of your skills.</li>
              <li><strong>Gamification & Badges:</strong> Earn badges for hitting milestones (like 50 questions solved, 7-day streak) and level up your global rank. All progress is persisted securely to the cloud via Supabase.</li>
              <li><strong>Settings Modal (⚙️):</strong> Customize your experience. Change the editor theme (Dark/Light), adjust font sizes, change pagination limits, and manage your AI API keys.</li>
            </ul>
          </section>

          <section id="faq">
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--text)', fontWeight: 800 }}>FAQ & Troubleshooting</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 }}>
              <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>Why did my browser freeze on a massive query?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>If you write <code>SELECT * FROM huge_table</code> without a limit, returning 50,000+ rows used to crash the DOM. However, our new pagination engine safely captures these massive arrays and strictly renders only 50 rows at a time, keeping your browser lightning fast!</p>
              </div>
              
              <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>Does this platform support stored procedures or triggers?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>Because the backend runs on SQLite, it fully supports Triggers, Views, and CTEs. However, SQLite does not natively support complex Stored Procedures (T-SQL or PL/pgSQL). Stick to standard ANSI SQL.</p>
              </div>
              
              <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>How is my progress saved?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>Your user profile, solved questions, and settings are safely backed by Supabase cloud storage, allowing for seamless progress persistence across devices.</p>
              </div>
              
              <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>How do the new AI features work?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>The AI Hint Panel and Solution Review utilize the Groq API for lightning-fast inference. You can configure your Groq API key securely within the Settings Modal.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
