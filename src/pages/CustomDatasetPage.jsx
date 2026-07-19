import React, {
  useState, useRef, useCallback, useEffect
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Upload, Play, RotateCcw, Database, Sun, Moon,
  ChevronRight, Trash2, Sparkles, ChevronDown, ArrowRight,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { ResultsPanel } from '@/features/practice/ResultsPanel';
import {
  groqChat, buildSandboxQuestionsPrompt, hasGroqKey, MODEL_SMART
} from '@/lib/groq';
import '@/styles/sandbox.css';

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function sanitizeColName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1') || 'col';
}
function detectType(values) {
  const nonEmpty = values.filter(v => v !== '' && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return 'TEXT';
  if (nonEmpty.every(v => !isNaN(Number(v)) && v.trim() !== '')) return 'REAL';
  return 'TEXT';
}
function csvToSql(csvText, tableName) {
  const lines = csvText.split(/\r?\n/);
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  if (nonEmpty.length < 2) throw new Error('CSV must have a header row and at least one data row.');
  const parseRow = (line) => {
    const result = []; let cur = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQuotes && line[i+1] === '"') { cur += '"'; i++; } else inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    result.push(cur.trim()); return result;
  };
  const headers = parseRow(nonEmpty[0]).map(sanitizeColName);
  const dataRows = nonEmpty.slice(1).map(parseRow);
  const types = headers.map((_, ci) => detectType(dataRows.map(r => r[ci] ?? '')));
  const safeName = sanitizeColName(tableName);
  const colDefs = headers.map((h, i) => `"${h}" ${types[i]}`).join(', ');
  let sql = `CREATE TABLE IF NOT EXISTS "${safeName}" (${colDefs});\n`;
  const BATCH = 500;
  for (let i = 0; i < dataRows.length; i += BATCH) {
    const batch = dataRows.slice(i, i + BATCH);
    const vals = batch.map(row => {
      const cells = headers.map((_, ci) => {
        const raw = (row[ci] ?? '').trim();
        if (raw === '') return 'NULL';
        if (types[ci] === 'REAL' && !isNaN(Number(raw))) return raw;
        return `'${raw.replace(/'/g, "''")}'`;
      });
      return `(${cells.join(', ')})`;
    });
    sql += `INSERT INTO "${safeName}" (${headers.map(h => `"${h}"`).join(', ')}) VALUES ${vals.join(', ')};\n`;
  }
  return sql;
}

// ─── AI Questions Panel ───────────────────────────────────────────────────────
function AiQuestionsPanel({ schema, sampleData, onSelectQuestion }) {
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [batch, setBatch]           = useState(0);
  const [collapsed, setCollapsed]   = useState(false);
  const hasKey = hasGroqKey();

  const generate = useCallback(async (batchIndex) => {
    if (!schema || schema.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const messages = buildSandboxQuestionsPrompt({ schema, sampleData, batch: batchIndex });
      // use MODEL_SMART for better question quality; useCache=false for variety
      const raw = await groqChat(messages, MODEL_SMART, 1200, false);
      // Strip markdown fences if present
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error('Unexpected response format.');
      setQuestions(parsed.slice(0, 5));
      setBatch(batchIndex + 1);
    } catch (err) {
      if (err.message === 'NO_KEY') {
        setError('no_key');
      } else if (err.message === 'RATE_LIMIT') {
        setError('rate_limit');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [schema, sampleData]);

  // Auto-generate on first mount when schema is ready and key exists
  useEffect(() => {
    if (schema && schema.length > 0 && hasKey && questions.length === 0 && !loading) {
      generate(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const diffColor = (d) => {
    if (d === 'Easy') return 'Easy';
    if (d === 'Hard') return 'Hard';
    return 'Medium';
  };

  return (
    <div className={`ai-questions-panel${collapsed ? ' collapsed' : ''}`}>

      {/* Header — acts as collapse toggle */}
      <div className="ai-questions-header" onClick={() => setCollapsed(c => !c)}>
        <Sparkles size={13} color="#7c3aed" />
        <div className="ai-questions-header-title">
          AI Interview Questions
          <span className="ai-questions-header-badge">MAANG</span>
          {loading && <RotateCcw size={11} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--muted)' }} />}
        </div>
        {!loading && !collapsed && questions.length > 0 && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '3px 8px', gap: 4, flexShrink: 0 }}
            onClick={e => { e.stopPropagation(); generate(batch); }}
          >
            <RefreshCw size={10} /> 5 More
          </button>
        )}
        <ChevronDown
          size={13}
          color="var(--muted)"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        />
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          <div className="ai-questions-body">

            {/* No Groq key */}
            {!hasKey && (
              <div className="ai-no-key-notice">
                <AlertCircle size={16} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--warning)' }} />
                <strong>Groq API key not found.</strong><br />
                Add your key in <strong>Settings → Groq API Key</strong> to enable AI-generated questions.
              </div>
            )}

            {/* Loading skeletons */}
            {hasKey && loading && [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="ai-skeleton-row" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="ai-skeleton-line" style={{ width: '30%' }} />
                <div className="ai-skeleton-line" style={{ width: '80%' }} />
              </div>
            ))}

            {/* Error states */}
            {hasKey && !loading && error && (
              <div className="ai-no-key-notice">
                {error === 'rate_limit' && (
                  <>⏳ <strong>Rate limit hit.</strong> Wait a few seconds then try again.</>
                )}
                {error === 'no_key' && (
                  <>🔑 Add your <strong>Groq API key</strong> in Settings to use AI questions.</>
                )}
                {error !== 'rate_limit' && error !== 'no_key' && (
                  <>❌ {error}</>
                )}
                <br />
                <button
                  className="btn btn-ghost"
                  style={{ margin: '8px auto 0', display: 'flex', fontSize: 11 }}
                  onClick={() => generate(batch)}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Questions list */}
            {hasKey && !loading && !error && questions.length > 0 && questions.map((q, i) => (
              <div
                key={`${batch}-${i}`}
                className="ai-question-row"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => onSelectQuestion(q)}
                title="Click to load into editor"
              >
                <span className="ai-question-num">{i + 1}</span>
                <div className="ai-question-meta">
                  <div className="ai-question-tags">
                    <span className={`ai-diff-badge ${diffColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <span className="ai-topic-tag">{q.topic}</span>
                  </div>
                  <div className="ai-question-title">{q.title}</div>
                </div>
                <ArrowRight size={13} className="ai-question-arrow" />
              </div>
            ))}

            {/* Empty state when key exists but nothing generated yet */}
            {hasKey && !loading && !error && questions.length === 0 && (
              <div className="ai-no-key-notice">
                <Sparkles size={16} style={{ margin: '0 auto 8px', display: 'block', color: '#7c3aed' }} />
                Click <strong>Generate</strong> to get 5 MAANG-style questions based on your dataset.
                <br />
                <button
                  className="btn btn-primary"
                  style={{ margin: '10px auto 0', display: 'flex', fontSize: 12, gap: 6 }}
                  onClick={() => generate(0)}
                >
                  <Sparkles size={12} /> Generate 5 Questions
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasKey && questions.length > 0 && !loading && (
            <div className="ai-questions-footer">
              <span className="ai-questions-footer-note">
                <Sparkles size={10} color="#7c3aed" />
                Powered by Groq · Click any question to load into editor
              </span>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11, padding: '3px 10px', gap: 4 }}
                onClick={() => generate(batch)}
              >
                <RefreshCw size={10} /> Generate 5 More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Schema Sidebar (with AI panel at bottom) ─────────────────────────────────
function SandboxSchemaSidebar({ schema, sampleData, onInsert, onSelectQuestion }) {
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (name) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <aside className="sandbox-sidebar">
      <div className="sandbox-sidebar-header">
        <div className="sandbox-sidebar-title">Schema Explorer</div>
        <div className="sandbox-sidebar-sub">
          {schema ? `${schema.length} table${schema.length !== 1 ? 's' : ''} • click to insert` : 'No dataset loaded'}
        </div>
      </div>

      <div className="sandbox-sidebar-body">
        {(!schema || schema.length === 0) && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Upload a file to see the schema here.
          </div>
        )}
        {schema && schema.map(table => {
          const isOpen = expanded.has(table.name);
          return (
            <div key={table.name} className="sandbox-table-item">
              <div className="sandbox-table-header" onClick={() => toggle(table.name)}>
                <span className="sandbox-table-icon">🗂️</span>
                <span className="sandbox-table-name">{table.name}</span>
                <span className="sandbox-table-count">{(table.rowCount || 0).toLocaleString()} rows</span>
                <ChevronRight size={12} className={`sandbox-table-chevron${isOpen ? ' open' : ''}`} />
              </div>
              {isOpen && (
                <div className="sandbox-columns-list">
                  {table.columns.map(col => (
                    <div
                      key={col.name}
                      className="sandbox-column-item"
                      onClick={() => onInsert(col.name)}
                      title={`Click to insert "${col.name}" into editor`}
                    >
                      {col.pk && <span className="sandbox-column-pk">🔑</span>}
                      <span>{col.name}</span>
                      <span className="sandbox-column-type">{col.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Questions Panel — pinned at sidebar bottom */}
      {schema && schema.length > 0 && (
        <AiQuestionsPanel
          schema={schema}
          sampleData={sampleData}
          onSelectQuestion={onSelectQuestion}
        />
      )}
    </aside>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFiles, uploading, schema, uploadStatus, onReset }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [onFiles]);

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length) onFiles(files);
    e.target.value = '';
  }, [onFiles]);

  // Compact bar (after dataset loaded)
  if (schema && schema.length > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {schema.map(t => (
            <span key={t.name} className="schema-table-chip">
              🗂️ {t.name}
              <span className="schema-table-chip-count">{(t.rowCount || 0).toLocaleString()} rows</span>
            </span>
          ))}
        </div>
        {uploadStatus && uploadStatus.type === 'success' && (
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✅ {uploadStatus.message}</span>
        )}
        <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} style={{ gap: 5, flexShrink: 0, fontSize: 12 }}>
          <Upload size={12} /> Add more
        </button>
        <button className="btn btn-ghost" onClick={onReset} style={{ gap: 5, color: 'var(--error)', flexShrink: 0, fontSize: 12 }}>
          <Trash2 size={12} /> Clear
        </button>
        <input ref={inputRef} type="file" accept=".csv,.sqlite,.db" multiple style={{ display: 'none' }} onChange={handleInputChange} />
      </div>
    );
  }

  // Full upload screen
  return (
    <div className="sandbox-upload-overlay">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Custom Dataset Practice
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Upload your own CSV or SQLite files. Practice SQL on your data with schema-aware autocomplete
          and <span style={{ color: '#7c3aed', fontWeight: 700 }}>AI-generated MAANG interview questions</span>.
        </p>
      </div>

      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv,.sqlite,.db" multiple style={{ display: 'none' }} onChange={handleInputChange} />
        <div className="upload-icon">
          {uploading ? <RotateCcw size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} /> : '📁'}
        </div>
        <div className="upload-title">
          {dragOver ? 'Drop it!' : uploading ? 'Processing...' : 'Drop your dataset here'}
        </div>
        <div className="upload-subtitle">
          {uploading ? 'Parsing your file and building the database...' : 'or click to browse your computer'}
        </div>
        <div className="upload-formats">
          {['.csv', '.sqlite', '.db'].map(fmt => (
            <span key={fmt} className="upload-format-tag">{fmt}</span>
          ))}
        </div>
        {!uploading && <div className="upload-cta">↑ Upload multiple CSVs — each becomes a table you can JOIN</div>}
        {uploading && (
          <div className="upload-progress-bar" style={{ width: '80%' }}>
            <div className="upload-progress-fill" style={{ width: '100%' }} />
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.type}`}>
          {uploadStatus.type === 'error' ? '❌' : uploadStatus.type === 'success' ? '✅' : '⏳'}
          {uploadStatus.message}
        </div>
      )}

      {/* AI teaser */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.05))',
        border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, maxWidth: 420,
        fontSize: 13, color: 'var(--text-secondary)',
      }}>
        <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
        <span>After upload, <strong style={{ color: 'var(--text)' }}>AI will auto-generate 5 MAANG-style questions</strong> based on your schema.</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CustomDatasetPage({ settings, onToggleDark }) {
  const navigate = useNavigate();
  const [schema, setSchema]           = useState(null);
  const [sampleData, setSampleData]   = useState({});  // {tableName: [[row]…]}
  const [sql, setSql]                 = useState('-- Write your SQL here\nSELECT * FROM your_table LIMIT 10;');
  const [result, setResult]           = useState(null);
  const [validation, setValidation]   = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDragging, setIsDragging]   = useState(false);
  const workspaceRef = useRef(null);

  const { executeQuery, initWithBinary, initWithSql, getSchema } = useSqlDatabase(null);

  // ── Resizable panes ──────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      setEditorHeightPct(Math.max(20, Math.min(80, pct)));
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // ── Fetch sample rows after schema loads (for AI prompt quality) ─────────
  const fetchSampleData = useCallback(async (tables) => {
    const samples = {};
    for (const t of tables) {
      try {
        const res = await executeQuery(`SELECT * FROM "${t.name}" LIMIT 3`);
        if (res && res.columns && res.rows) {
          samples[t.name] = res.rows.map(row =>
            Object.fromEntries(res.columns.map((col, i) => [col, row[i]]))
          );
        }
      } catch { /* skip */ }
    }
    setSampleData(samples);
  }, [executeQuery]);

  // ── File processing ──────────────────────────────────────────────────────
  const processFiles = useCallback(async (files) => {
    setUploading(true);
    setUploadStatus({ type: 'loading', message: 'Parsing files...' });
    setSampleData({});
    try {
      const csvFiles    = files.filter(f => f.name.endsWith('.csv'));
      const sqliteFiles = files.filter(f => f.name.endsWith('.sqlite') || f.name.endsWith('.db'));

      if (sqliteFiles.length > 1)
        throw new Error('Only one SQLite file at a time. Use multiple CSVs for JOINs.');
      if (sqliteFiles.length === 1 && csvFiles.length > 0)
        throw new Error('Cannot mix .sqlite and .csv files.');

      if (sqliteFiles.length === 1) {
        const buf = await sqliteFiles[0].arrayBuffer();
        await initWithBinary(new Uint8Array(buf));
      } else if (csvFiles.length > 0) {
        let combinedSql = '';
        for (const f of csvFiles) {
          const text = await f.text();
          const tableName = f.name.replace(/\.csv$/i, '');
          setUploadStatus({ type: 'loading', message: `Parsing ${f.name}...` });
          combinedSql += csvToSql(text, tableName) + '\n';
        }
        await initWithSql(combinedSql);
      } else {
        throw new Error('Please upload at least one .csv or .sqlite file.');
      }

      const schemaData = await getSchema();
      const tables = schemaData?.tables || [];
      if (tables.length === 0)
        throw new Error('No tables found. Check your file has data.');

      setSchema(tables);
      const firstTable = tables[0];
      setSql(`-- ✅ Dataset loaded! ${tables.length} table${tables.length > 1 ? 's' : ''} detected.\n-- 💡 Autocomplete ready (Ctrl+Space) · AI questions generating below ↙\n\nSELECT *\nFROM "${firstTable.name}"\nLIMIT 10;`);

      const totalRows = tables.reduce((a, t) => a + (t.rowCount || 0), 0);
      setUploadStatus({
        type: 'success',
        message: `${tables.length} table${tables.length > 1 ? 's' : ''} · ${totalRows.toLocaleString()} rows`
      });

      // Fetch sample data for AI prompt (non-blocking)
      fetchSampleData(tables);

    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message });
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [initWithBinary, initWithSql, getSchema, fetchSampleData]);

  // ── Run query ────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!sql.trim() || !schema) return;
    setIsExecuting(true);
    try {
      const res = await executeQuery(sql);
      setResult(res);
      setValidation(res.error ? { isCorrect: false, message: res.error } : null);
    } finally {
      setIsExecuting(false);
    }
  }, [sql, executeQuery, schema]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [handleRun]);

  // ── Load AI question into editor ─────────────────────────────────────────
  const handleSelectAiQuestion = useCallback((q) => {
    setSql(
      `-- 🤖 MAANG Interview Question: ${q.title}\n` +
      `-- Difficulty: ${q.difficulty} | Topic: ${q.topic}\n` +
      `--\n` +
      `-- ${q.prompt.replace(/\n/g, '\n-- ')}\n\n` +
      `-- Write your SQL solution below:\n\n`
    );
    setResult(null);
    setValidation(null);
  }, []);

  const handleInsertColumn = useCallback((colName) => {
    setSql(prev => prev + colName);
  }, []);

  const handleReset = useCallback(() => {
    setSchema(null); setSampleData({});
    setResult(null); setValidation(null); setUploadStatus(null);
    setSql('-- Write your SQL here\nSELECT * FROM your_table LIMIT 10;');
  }, []);

  const darkMode    = settings?.darkMode ?? false;
  const hasDataset  = schema && schema.length > 0;

  return (
    <div className="sandbox-root" data-theme={darkMode ? 'dark' : 'light'}>

      {/* ── Nav ── */}
      <nav className="sandbox-nav">
        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ gap: 5 }}>
          <Home size={14} /> Home
        </button>

        <div className="sandbox-nav-title">
          <Database size={15} color="var(--primary)" />
          Custom Dataset Practice
          <span className="sandbox-nav-badge">✨ Sandbox</span>
        </div>

        <div style={{ flex: 1 }} />

        {hasDataset && (
          <button
            id="sandbox-run-btn"
            className="btn btn-primary"
            onClick={handleRun}
            disabled={isExecuting || !sql.trim()}
            style={{ gap: 6 }}
          >
            {isExecuting
              ? <RotateCcw size={14} className="spin" />
              : <Play size={14} strokeWidth={2.5} fill="currentColor" />}
            {isExecuting ? 'Running...' : 'Run Query'}
          </button>
        )}

        <button
          className="btn btn-ghost"
          onClick={onToggleDark}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
          style={{ padding: '6px 9px' }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* ── Upload zone / compact bar ── */}
      {!hasDataset ? (
        <UploadZone
          onFiles={processFiles} uploading={uploading}
          schema={schema} uploadStatus={uploadStatus} onReset={handleReset}
        />
      ) : (
        <>
          <UploadZone
            onFiles={processFiles} uploading={uploading}
            schema={schema} uploadStatus={uploadStatus} onReset={handleReset}
          />

          {/* ── Main workspace ── */}
          <div className="sandbox-layout" style={{ flex: 1, minHeight: 0 }}>

            {/* Left: Schema + AI questions */}
            <SandboxSchemaSidebar
              schema={schema}
              sampleData={sampleData}
              onInsert={handleInsertColumn}
              onSelectQuestion={handleSelectAiQuestion}
            />

            {/* Right: Editor + Results */}
            <div
              className="sandbox-workspace"
              ref={workspaceRef}
              style={{ gridTemplateRows: `${editorHeightPct}% 6px 1fr` }}
            >
              {/* Editor */}
              <div className="sandbox-editor-pane">
                <div className="sandbox-editor-header">
                  <span className="sandbox-pane-label">SQL Editor</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Ctrl+Enter to run</span>
                </div>
                <div className="sandbox-editor-body">
                  <SqlEditor
                    value={sql}
                    onChange={setSql}
                    onRun={handleRun}
                    disabled={isExecuting}
                    dbName={null}
                    customSchema={schema}
                    fontSize={settings?.editorFontSize || 14}
                    autoComplete={settings?.autoCompleteSql !== false}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Resizer */}
              <div
                className={`sandbox-resizer${isDragging ? ' dragging' : ''}`}
                onMouseDown={() => setIsDragging(true)}
              />

              {/* Results */}
              <div className="sandbox-results-pane">
                <ResultsPanel
                  result={result}
                  validation={validation}
                  sql={sql}
                  executeQuery={executeQuery}
                  isRunning={isExecuting}
                  question={null}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
