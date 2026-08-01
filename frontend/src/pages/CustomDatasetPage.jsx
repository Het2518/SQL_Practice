import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Upload,
  Play,
  RotateCcw,
  Database,
  Sun,
  Moon,
  ChevronRight,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  ListOrdered,
  CheckCircle2,
} from 'lucide-react';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { ResultsPanel } from '@/features/practice/ResultsPanel';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { groqChat, buildSandboxQuestionsPrompt, useGroqKey, MODEL_SMART } from '@/lib/groq';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import '@/styles/sandbox.css';

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function sanitizeColName(n) {
  return n.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1') || 'col';
}
function detectType(vals) {
  const ne = vals.filter((v) => v !== '' && v != null);
  if (!ne.length) return 'TEXT';
  return ne.every((v) => !isNaN(Number(v)) && String(v).trim() !== '') ? 'REAL' : 'TEXT';
}
function csvToSql(csvText, tableName) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('CSV needs a header row + at least one data row.');
  const parseRow = (line) => {
    const res = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = !q;
      } else if (c === ',' && !q) {
        res.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    res.push(cur.trim());
    return res;
  };
  const headers = parseRow(lines[0]).map(sanitizeColName);
  const dataRows = lines.slice(1).map(parseRow);
  const types = headers.map((_, ci) => detectType(dataRows.map((r) => r[ci] ?? '')));
  const safe = sanitizeColName(tableName);
  let sql = `CREATE TABLE IF NOT EXISTS "${safe}" (${headers.map((h, i) => `"${h}" ${types[i]}`).join(', ')});\n`;
  for (let i = 0; i < dataRows.length; i += 500) {
    const batch = dataRows.slice(i, i + 500);
    const vals = batch.map(
      (row) =>
        `(${headers
          .map((_, ci) => {
            const raw = (row[ci] ?? '').trim();
            if (!raw) return 'NULL';
            if (types[ci] === 'REAL' && !isNaN(Number(raw))) return raw;
            return `'${raw.replace(/'/g, "''")}'`;
          })
          .join(', ')})`
    );
    sql += `INSERT INTO "${safe}" (${headers.map((h) => `"${h}"`).join(', ')}) VALUES ${vals.join(', ')};\n`;
  }
  return sql;
}

// ─── LEFT — Schema Sidebar ─────────────────────────────────────────────────────
function SchemaSidebar({ schema, onInsert }) {
  const [expanded, setExpanded] = useState(new Set());
  const toggle = (name) =>
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(name) ? s.delete(name) : s.add(name);
      return s;
    });

  return (
    <aside className="sb-schema-root">
      {/* Header */}
      <div className="sb-schema-header">
        <div className="sb-schema-name">
          <Database size={14} color="var(--primary)" />
          <span>Dataset</span>
        </div>
        {schema && (
          <span className="sb-schema-count">
            {schema.length} table{schema.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tab row (matches your platform) */}
      <div className="sb-schema-tabs">
        <button className="sb-schema-tab sb-schema-tab-active">Schema</button>
      </div>

      {/* Tables */}
      <div className="sb-schema-body">
        {!schema?.length && (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Upload a CSV or SQLite file to explore schema here.
          </div>
        )}

        {schema?.length > 0 && (
          <div
            style={{
              padding: '8px 12px 4px',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Tables
          </div>
        )}

        {schema?.map((table) => {
          const isOpen = expanded.has(table.name);
          return (
            <div key={table.name} className="sb-table-group">
              <div className="sb-table-row" onClick={() => toggle(table.name)}>
                <ChevronRight size={12} className={`sb-table-chevron${isOpen ? ' open' : ''}`} />
                <span className="sb-table-name">{table.name}</span>
                <span className="sb-table-badge">
                  {(table.rowCount || 0).toLocaleString()} rows
                </span>
              </div>
              {isOpen && (
                <div className="sb-columns">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      className="sb-col-row"
                      onClick={() => onInsert(col.name)}
                      title={`Insert "${col.name}"`}
                    >
                      {col.pk ? (
                        <span className="sb-col-icon sb-col-pk">PK</span>
                      ) : (
                        <span className="sb-col-icon sb-col-field">○</span>
                      )}
                      <span className="sb-col-name">{col.name}</span>
                      <span className="sb-col-type">{col.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ─── RIGHT — AI Questions Panel ───────────────────────────────────────────────
function QuestionsPanel({ schema, sampleData, onLoadQuestion, visible, onToggle }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batch, setBatch] = useState(0);
  const [selected, setSelected] = useState(null); // null = list; object = detail
  const [qIndex, setQIndex] = useState(0); // current question index when in detail
  const hasKey = useGroqKey();

  const generate = useCallback(
    async (batchIndex) => {
      if (!schema?.length) return;
      setLoading(true);
      setError(null);
      try {
        const messages = buildSandboxQuestionsPrompt({ schema, sampleData, batch: batchIndex });
        const raw = await groqChat(messages, MODEL_SMART, 1200, false);
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) throw new Error('Bad response.');
        setQuestions(parsed.slice(0, 5));
        setBatch(batchIndex + 1);
        setSelected(null);
      } catch (err) {
        setError(
          err.message === 'NO_KEY'
            ? 'no_key'
            : err.message === 'RATE_LIMIT'
              ? 'rate_limit'
              : err.message
        );
      } finally {
        setLoading(false);
      }
    },
    [schema, sampleData]
  );

  useEffect(() => {
    if (schema?.length && hasKey && questions.length === 0 && !loading) generate(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const openQuestion = (q, idx) => {
    setSelected(q);
    setQIndex(idx);
    onLoadQuestion(q);
  };

  const goTo = (delta) => {
    const next = qIndex + delta;
    if (next >= 0 && next < questions.length) openQuestion(questions[next], next);
  };

  // ── Collapsed ──────────────────────────────────────────────────────────
  if (!visible) {
    return (
      <div className="qp-root qp-collapsed">
        <button className="qp-toggle" onClick={onToggle} title="Show Questions">
          <PanelRightOpen size={14} />
        </button>
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="qp-root">
        {/* Header row: All Questions nav */}
        <div className="qp-header">
          <button className="qp-all-btn" onClick={() => setSelected(null)}>
            <ListOrdered size={12} /> All Questions
          </button>
          <div className="qp-nav">
            <button className="qp-nav-btn" onClick={() => goTo(-1)} disabled={qIndex <= 0}>
              ←
            </button>
            <span className="qp-nav-pos">
              {qIndex + 1} / {questions.length}
            </span>
            <button
              className="qp-nav-btn"
              onClick={() => goTo(1)}
              disabled={qIndex >= questions.length - 1}
            >
              →
            </button>
          </div>
          <button className="qp-toggle" onClick={onToggle} title="Hide panel">
            <PanelRightClose size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="qp-detail-body">
          {/* Badges */}
          <div className="qp-detail-badges">
            <Badge variant={selected.difficulty}>{selected.difficulty}</Badge>
            <span className="qp-detail-status">○ Unsolved</span>
          </div>

          {/* Prompt */}
          <div className="qp-detail-text">
            {(selected.prompt || '').split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 10px' }}>
                {line}
              </p>
            ))}
          </div>

          {/* Topic tags */}
          <div className="qp-detail-tags">
            <span className="qp-tag">{selected.topic}</span>
            <span className="qp-tag qp-tag-maang">MAANG</span>
          </div>

          {/* Hint box */}
          <div className="qp-hint-box">
            <div className="qp-hint-label">
              <Sparkles
                size={12}
                style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}
              />{' '}
              Hint
            </div>
            <div className="qp-hint-text">
              Write SQL in the editor. Press <kbd>Ctrl+Enter</kbd> to run.
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="qp-footer">
          <span>
            <Sparkles size={9} color="var(--accent-1)" /> Powered by Groq AI
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              setSelected(null);
              generate(batch);
            }}
          >
            Next 5
          </Button>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────
  return (
    <div className="qp-root">
      {/* Header */}
      <div className="qp-header">
        <span className="qp-header-title">
          <Sparkles size={12} color="var(--accent-1)" /> AI Questions
          <span className="qp-header-badge">MAANG</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!loading && questions.length > 0 && (
            <button className="qp-more-btn" onClick={() => generate(batch)}>
              <RefreshCw size={10} /> Next 5
            </button>
          )}
          {loading && (
            <RotateCcw
              size={12}
              style={{ animation: 'spin 0.8s linear infinite', color: 'var(--muted)' }}
            />
          )}
          <button className="qp-toggle" onClick={onToggle} title="Hide panel">
            <PanelRightClose size={13} />
          </button>
        </div>
      </div>

      {/* List body */}
      <div className="qp-list-body">
        {/* No key */}
        {!hasKey && (
          <div className="qp-notice">
            <AlertCircle size={15} color="var(--warning)" />
            <div>
              Add your <strong>Groq API key</strong> in Settings to enable AI questions.
            </div>
          </div>
        )}

        {/* Skeletons */}
        {hasKey &&
          loading &&
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div
                style={{
                  height: 9,
                  borderRadius: 4,
                  width: '30%',
                  marginBottom: 8,
                  background:
                    'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
                  backgroundSize: '200%',
                  animation: `shimmer 1.4s infinite ${i * 0.07}s`,
                }}
              />
              <div
                style={{
                  height: 13,
                  borderRadius: 4,
                  width: '80%',
                  background:
                    'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
                  backgroundSize: '200%',
                  animation: `shimmer 1.4s infinite ${i * 0.1}s`,
                }}
              />
            </div>
          ))}

        {/* Error */}
        {hasKey && !loading && error && (
          <div className="qp-notice qp-notice-error">
            <AlertCircle size={14} />
            <div>
              {error === 'rate_limit'
                ? 'Rate limit — wait a moment.'
                : error === 'no_key'
                  ? 'Add Groq API key.'
                  : error}
              <br />
              <button className="qp-retry-btn" onClick={() => generate(batch)}>
                ↺ Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {hasKey && !loading && !error && questions.length === 0 && (
          <div className="qp-empty">
            <Sparkles size={20} color="var(--accent-1)" />
            <div style={{ fontWeight: 600 }}>No questions yet</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Generate 5 MAANG-style SQL questions for your dataset.
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => generate(0)}
              style={{ marginTop: '16px' }}
            >
              Generate Questions
            </Button>
          </div>
        )}

        {/* Question rows */}
        {hasKey &&
          !loading &&
          !error &&
          questions.map((q, i) => (
            <div
              key={`${batch}-${i}`}
              className="qp-row"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => openQuestion(q, i)}
            >
              <div className="qp-row-num">{i + 1}.</div>
              <div className="qp-row-body">
                <div className="qp-row-title">{q.title}</div>
                <div className="qp-row-meta">
                  <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                  <span className="qp-row-topic">{q.topic}</span>
                </div>
              </div>
              <ChevronRight size={14} className="qp-row-arrow" />
            </div>
          ))}
      </div>

      {/* Footer */}
      {hasKey && questions.length > 0 && !loading && (
        <div className="qp-footer">
          <span>
            <Sparkles size={9} color="var(--accent-1)" /> Groq AI · Click a question to load
          </span>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => generate(batch)}>
            5 More
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFiles, uploading, schema, uploadStatus, onReset }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = Array.from(e.dataTransfer.files);
      if (f.length) onFiles(f);
    },
    [onFiles]
  );
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onChange = useCallback(
    (e) => {
      const f = Array.from(e.target.files);
      if (f.length) onFiles(f);
      e.target.value = '';
    },
    [onFiles]
  );

  // Compact bar after load
  if (schema?.length) {
    return (
      <div className="sb-topbar">
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {schema.map((t) => (
            <span key={t.name} className="schema-table-chip">
              <Database
                size={12}
                style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'text-bottom' }}
              />{' '}
              {t.name}
              <span className="schema-table-chip-count">
                {(t.rowCount || 0).toLocaleString()} rows
              </span>
            </span>
          ))}
          {uploadStatus?.type === 'success' && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--success)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCircle2 size={12} /> Loaded
            </span>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => inputRef.current?.click()}
          style={{ gap: 5, fontSize: 11 }}
        >
          <Upload size={11} /> Add
        </button>
        <button
          className="btn btn-ghost"
          onClick={onReset}
          style={{ gap: 5, color: 'var(--error)', fontSize: 11 }}
        >
          <Trash2 size={11} /> Clear
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.sqlite,.db"
          multiple
          style={{ display: 'none' }}
          onChange={onChange}
        />
      </div>
    );
  }

  // Full upload screen
  return (
    <div className="sandbox-upload-overlay">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Custom Dataset Practice
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 460,
            margin: '0 auto',
          }}
        >
          Upload CSV or SQLite files. Practice SQL with{' '}
          <span style={{ color: 'var(--accent-1)', fontWeight: 700 }}>
            AI-generated MAANG interview questions
          </span>
          .
        </p>
      </div>
      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.sqlite,.db"
          multiple
          style={{ display: 'none' }}
          onChange={onChange}
        />
        <div className="upload-icon">
          {uploading ? (
            <RotateCcw
              size={26}
              color="var(--primary)"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
          ) : (
            <Upload size={26} color="var(--primary)" />
          )}
        </div>
        <div className="upload-title">
          {dragOver ? 'Drop it!' : uploading ? 'Processing...' : 'Drop your dataset here'}
        </div>
        <div className="upload-subtitle">
          {uploading ? 'Parsing files...' : 'or click to browse · .csv .sqlite .db'}
        </div>
        {!uploading && (
          <div className="upload-cta">Multiple CSVs = multiple tables you can JOIN</div>
        )}
        {uploading && (
          <div className="upload-progress-bar" style={{ width: '80%' }}>
            <div className="upload-progress-fill" style={{ width: '100%' }} />
          </div>
        )}
      </div>
      {uploadStatus && (
        <div
          className={`upload-status ${uploadStatus.type}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
        >
          {uploadStatus.type === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <RotateCcw size={14} className="spin" />
          )}{' '}
          {uploadStatus.message}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 18px',
          background: 'var(--primary-muted)',
          border: '1px solid var(--primary-light)',
          borderRadius: 10,
          maxWidth: 400,
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <Sparkles size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          After upload, AI generates{' '}
          <strong style={{ color: 'var(--text)' }}>5 MAANG-style questions</strong> for your schema.
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CustomDatasetPage() {
  const { settings, updateSettings } = useSettingsStore();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [sampleData, setSampleData] = useState({});
  const [sql, setSql] = useState('-- Write your SQL here\nSELECT * FROM your_table LIMIT 10;');
  const [result, setResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editorHeightPct, setEditorHeightPct] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const [qPanelVisible, setQPanelVisible] = useState(true);
  const workspaceRef = useRef(null);

  const onToggleDark = useCallback(() => {
    updateSettings({ darkMode: !settings?.darkMode });
  }, [settings?.darkMode, updateSettings]);

  const { executeQuery, initWithBinary, initWithSql, getSchema } = useSqlDatabase(null);

  // Resizable editor/results
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || !workspaceRef.current) return;
      const r = workspaceRef.current.getBoundingClientRect();
      setEditorHeightPct(Math.max(20, Math.min(80, ((e.clientY - r.top) / r.height) * 100)));
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
    } else document.body.style.userSelect = '';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // Sample data for AI
  const fetchSampleData = useCallback(
    async (tables) => {
      const s = {};
      for (const t of tables) {
        try {
          const r = await executeQuery(`SELECT * FROM "${t.name}" LIMIT 3`);
          if (r?.columns && r?.rows)
            s[t.name] = r.rows.map((row) =>
              Object.fromEntries(r.columns.map((c, i) => [c, row[i]]))
            );
        } catch {
          /**/
        }
      }
      setSampleData(s);
    },
    [executeQuery]
  );

  // File processing
  const processFiles = useCallback(
    async (files) => {
      setUploading(true);
      setUploadStatus({ type: 'loading', message: 'Parsing files...' });
      setSampleData({});
      try {
        const csvs = files.filter((f) => f.name.endsWith('.csv'));
        const sqlites = files.filter((f) => f.name.endsWith('.sqlite') || f.name.endsWith('.db'));
        if (sqlites.length > 1) throw new Error('Only one SQLite file at a time.');
        if (sqlites.length === 1 && csvs.length > 0)
          throw new Error('Cannot mix .sqlite and .csv.');
        if (sqlites.length === 1) {
          await initWithBinary(new Uint8Array(await sqlites[0].arrayBuffer()));
        } else if (csvs.length > 0) {
          let combined = '';
          for (const f of csvs) {
            setUploadStatus({ type: 'loading', message: `Parsing ${f.name}...` });
            combined += csvToSql(await f.text(), f.name.replace(/\.csv$/i, '')) + '\n';
          }
          await initWithSql(combined);
        } else throw new Error('Upload at least one .csv or .sqlite file.');

        const tables = (await getSchema())?.tables || [];
        if (!tables.length) throw new Error('No tables found. Check your file.');
        setSchema(tables);
        setSql(
          `-- ✅ ${tables.length} table${tables.length > 1 ? 's' : ''} loaded.\n-- AI questions are generating in the right panel →\n\nSELECT *\nFROM "${tables[0].name}"\nLIMIT 10;`
        );
        const total = tables.reduce((a, t) => a + (t.rowCount || 0), 0);
        setUploadStatus({
          type: 'success',
          message: `${tables.length} table${tables.length > 1 ? 's' : ''} · ${total.toLocaleString()} rows`,
        });
        fetchSampleData(tables);
      } catch (err) {
        setUploadStatus({ type: 'error', message: err.message });
      } finally {
        setUploading(false);
      }
    },
    [initWithBinary, initWithSql, getSchema, fetchSampleData]
  );

  // Run query
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

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleRun]);

  // Load AI question
  const handleLoadQuestion = useCallback((q) => {
    setSql(
      `-- ────────────────────────────────────────────────\n` +
        `--  ${q.title}\n` +
        `--  ${q.difficulty}  ·  ${q.topic}\n` +
        `-- ────────────────────────────────────────────────\n` +
        `--\n` +
        `-- ${(q.prompt || '').replace(/\n/g, '\n-- ')}\n\n`
    );
    setResult(null);
    setValidation(null);
  }, []);

  const handleReset = useCallback(() => {
    setSchema(null);
    setSampleData({});
    setResult(null);
    setValidation(null);
    setUploadStatus(null);
    setSql('-- Write your SQL here\nSELECT * FROM your_table LIMIT 10;');
  }, []);

  const darkMode = settings?.darkMode ?? false;
  const hasData = schema?.length > 0;

  return (
    <div className="sandbox-root" data-theme={darkMode ? 'dark' : 'light'}>
      {/* ── Nav ── */}
      <nav className="sandbox-nav">
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/')}
          style={{ gap: 5, fontSize: 12 }}
        >
          <Home size={13} /> Home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={14} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
            Custom Dataset
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 4,
              background: 'var(--primary-muted)',
              color: 'var(--primary)',
            }}
          >
            Sandbox
          </span>
        </div>

        {/* Centered Run button */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {hasData && (
            <button
              id="sandbox-run-btn"
              className="btn btn-primary"
              onClick={handleRun}
              disabled={isExecuting || !sql.trim()}
              style={{
                gap: 8,
                minWidth: 150,
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {isExecuting ? (
                <>
                  <RotateCcw size={13} className="spin" /> Running...
                </>
              ) : (
                <>
                  <Play size={13} strokeWidth={2.5} fill="currentColor" /> Run&nbsp;&nbsp;Ctrl+↵
                </>
              )}
            </button>
          )}
        </div>

        {!qPanelVisible && hasData && (
          <button
            className="btn btn-ghost"
            onClick={() => setQPanelVisible(true)}
            style={{ gap: 5, fontSize: 11 }}
          >
            <Sparkles size={12} color="var(--accent-1)" /> AI Questions
          </button>
        )}

        <button className="btn btn-ghost" onClick={onToggleDark} style={{ padding: '6px 8px' }}>
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </nav>

      {/* ── Main ── */}
      {!hasData ? (
        <UploadZone
          onFiles={processFiles}
          uploading={uploading}
          schema={schema}
          uploadStatus={uploadStatus}
          onReset={handleReset}
        />
      ) : (
        <>
          {/* Dataset bar */}
          <UploadZone
            onFiles={processFiles}
            uploading={uploading}
            schema={schema}
            uploadStatus={uploadStatus}
            onReset={handleReset}
          />

          {/* ── Layout: Schema | Editor+Results | Questions ── */}
          <div className="cds-layout">
            {/* LEFT — Schema */}
            <SchemaSidebar schema={schema} onInsert={(col) => setSql((p) => p + col)} />

            {/* CENTER — Editor + Results */}
            <div
              className="cds-center"
              ref={workspaceRef}
              style={{ gridTemplateRows: `${editorHeightPct}% 5px 1fr` }}
            >
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
              <div
                className={`sandbox-resizer${isDragging ? ' dragging' : ''}`}
                onMouseDown={() => setIsDragging(true)}
              />
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

            {/* RIGHT — AI Questions */}
            <QuestionsPanel
              schema={schema}
              sampleData={sampleData}
              onLoadQuestion={handleLoadQuestion}
              visible={qPanelVisible}
              onToggle={() => setQPanelVisible((v) => !v)}
            />
          </div>
        </>
      )}
    </div>
  );
}
