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
import { groqChat, buildSandboxQuestionsPrompt, useGroqKey, MODEL_SMART, generateSchema } from '@/lib/groq';
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
          <div className="px-4 py-6 text-center text-muted text-xs leading-relaxed">
            Upload a CSV or SQLite file to explore schema here.
          </div>
        )}

        {schema?.length > 0 && (
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted tracking-widest uppercase">
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
              <p key={i} className="m-0 mb-2.5">
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
                className="inline align-middle mr-1"
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
        <div className="flex items-center gap-1.5">
          {!loading && questions.length > 0 && (
            <button className="qp-more-btn" onClick={() => generate(batch)}>
              <RefreshCw size={10} /> Next 5
            </button>
          )}
          {loading && (
            <RotateCcw
              size={12}
              className="animate-[spin_0.8s_linear_infinite] text-muted"
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
            <div key={i} className="px-4 py-3.5 border-b border-border">
              <div
                className="h-[9px] rounded w-[30%] mb-2"
                style={{
                  background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
                  backgroundSize: '200%',
                  animation: `shimmer 1.4s infinite ${i * 0.07}s`,
                }}
              />
              <div
                className="h-[13px] rounded w-[80%]"
                style={{
                  background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
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
            <div className="font-semibold">No questions yet</div>
            <div className="text-xs text-text-secondary">
              Generate 5 MAANG-style SQL questions for your dataset.
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => generate(0)}
              className="mt-4"
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
function UploadZone({ onFiles, uploading, schema, uploadStatus, onReset, onAiGenerate, generatingSchema }) {
  const [dragOver, setDragOver] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
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
        <div className="flex gap-1.5 flex-1 flex-wrap items-center">
          {schema.map((t) => (
            <span key={t.name} className="schema-table-chip">
              <Database
                size={12}
                className="inline-block align-text-bottom mr-1"
              />{' '}
              {t.name}
              <span className="schema-table-chip-count">
                {(t.rowCount || 0).toLocaleString()} rows
              </span>
            </span>
          ))}
          {uploadStatus?.type === 'success' && (
            <span className="text-[11px] text-success font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Loaded
            </span>
          )}
        </div>
        <button
          className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={13} /> Add
        </button>
        <button
          className="flex items-center gap-1.5 text-[11px] text-error px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
          onClick={onReset}
        >
          <Trash2 size={13} /> Clear
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.sqlite,.db"
          multiple
          className="hidden"
          onChange={onChange}
        />
      </div>
    );
  }

  // Full upload screen
  return (
    <div className="sandbox-upload-overlay">
      <div className="text-center">
        <h1 className="text-[26px] font-bold text-text mb-2">
          Custom Dataset Practice
        </h1>
        <p className="text-text-secondary text-sm leading-[1.7] max-w-[460px] mx-auto">
          Upload CSV or SQLite files. Practice SQL with{' '}
          <span className="text-accent-1 font-bold">
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
          className="hidden"
          onChange={onChange}
        />
        <div className="upload-icon">
          {uploading ? (
            <RotateCcw
              size={26}
              color="var(--primary)"
              className="animate-[spin_0.8s_linear_infinite]"
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
          <div className="upload-progress-bar w-[80%]">
            <div className="upload-progress-fill w-full" />
          </div>
        )}
      </div>
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.type} flex items-center justify-center gap-1.5`}>
          {uploadStatus.type === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <RotateCcw size={14} className="spin" />
          )}{' '}
          {uploadStatus.message}
        </div>
      )}
      <div className="flex items-center justify-center gap-2.5 px-4.5 py-2.5 bg-primary-muted border border-primary-light rounded-xl max-w-[400px] text-xs text-text-secondary mx-auto mt-4">
        <Sparkles size={14} color="var(--primary)" className="shrink-0" />
        <span>
          After upload, AI generates{' '}
          <strong className="text-text">5 MAANG-style questions</strong> for your schema.
        </span>
      </div>

      {/* AI Generate Box */}
      <div className="mt-8 w-full max-w-[520px] mx-auto">
        <div className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2 justify-center">
          <Sparkles size={16} color="var(--primary)" /> Generate Schema with AI
        </div>
        <div className="flex gap-2.5 bg-surface-2 p-1.5 rounded-xl border border-border">
           <input 
             type="text" 
             value={aiPrompt}
             onChange={e => setAiPrompt(e.target.value)}
             placeholder="e.g. A hospital with patients and doctors" 
             className="flex-1 px-4 py-2.5 rounded-lg border-none bg-transparent text-text text-sm outline-none"
             onKeyDown={e => e.key === 'Enter' && !generatingSchema && aiPrompt.trim() && onAiGenerate(aiPrompt)}
             disabled={generatingSchema || uploading}
           />
           <Button 
             onClick={() => onAiGenerate(aiPrompt)} 
             disabled={!aiPrompt.trim() || generatingSchema || uploading} 
             variant="primary"
             size="md"
             className="rounded-lg px-6 font-semibold"
           >
             {generatingSchema ? 'Building...' : 'Generate'}
           </Button>
        </div>
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
  const [generatingSchema, setGeneratingSchema] = useState(false);
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

  // AI Schema Generation
  const handleAiGenerate = useCallback(
    async (promptText) => {
      if (!promptText.trim()) return;
      setGeneratingSchema(true);
      setUploadStatus({ type: 'loading', message: 'AI is building your sandbox...' });
      setSampleData({});
      try {
        const generatedSql = await generateSchema(promptText);
        await initWithSql(generatedSql);

        const tables = (await getSchema())?.tables || [];
        if (!tables.length) throw new Error('AI failed to generate a valid schema. Please try a different prompt.');
        
        setSchema(tables);
        setSql(
          `-- ✅ AI generated ${tables.length} table${tables.length > 1 ? 's' : ''}.\n-- AI questions are generating in the right panel →\n\nSELECT *\nFROM "${tables[0].name}"\nLIMIT 10;`
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
        setGeneratingSchema(false);
      }
    },
    [initWithSql, getSchema, fetchSampleData]
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
    <div className="sandbox-root flex-1 w-full h-full flex flex-col overflow-hidden page-enter" data-theme={darkMode ? 'dark' : 'light'}>
      {/* ── Nav ── */}
      <nav className="sandbox-nav">
        <button
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
          onClick={() => navigate('/')}
        >
          <Home size={15} /> Home
        </button>

        <div className="flex items-center gap-2">
          <Database size={15} color="var(--primary)" />
          <span className="font-bold text-sm text-text">
            Custom Dataset
          </span>
          <span className="text-[10px] font-bold px-[7px] py-[2px] rounded bg-primary-muted text-primary">
            Sandbox
          </span>
        </div>

        {/* Center space placeholder to push right icons to the edge */}
        <div className="flex-1" />

        {!qPanelVisible && hasData && (
          <button
            className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
            onClick={() => setQPanelVisible(true)}
          >
            <Sparkles size={14} color="var(--accent-1)" /> AI Questions
          </button>
        )}

        <button className="flex items-center justify-center px-2 py-1.5 rounded-md text-text-secondary hover:text-text hover:bg-surface-2 transition-colors" onClick={onToggleDark}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
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
          onAiGenerate={handleAiGenerate}
          generatingSchema={generatingSchema}
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
            onAiGenerate={handleAiGenerate}
            generatingSchema={generatingSchema}
          />

          {/* ── Layout: Schema | Editor+Results | Questions ── */}
          <div className="cds-layout">
            {/* LEFT — Schema */}
            <SchemaSidebar schema={schema} onInsert={(col) => setSql((p) => p + col)} />

            {/* CENTER — Editor + Results */}
            <div
              className="flex-1 flex flex-col h-full overflow-hidden bg-bg min-w-[300px]"
              ref={workspaceRef}
            >
              {/* EDITOR SECTION */}
              <div 
                className="shrink-0 flex flex-col bg-surface border-b border-border min-h-[140px] overflow-hidden"
                style={{ height: `${editorHeightPct}%` }}
              >
                <div className="flex-1 relative min-h-0 bg-surface overflow-hidden">
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
                <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-t border-border shrink-0">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSql('')}>
                      <RotateCcw size={13} /> Clear
                    </Button>
                  </div>
                  <Button size="sm" onClick={handleRun} isLoading={isExecuting}>
                    <Play size={13} fill="currentColor" /> Run Code (Ctrl+Enter)
                  </Button>
                </div>
              </div>
              
              {/* RESIZER */}
              <div
                className={`h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10 shrink-0${isDragging ? ' dragging' : ''}`}
                onMouseDown={() => setIsDragging(true)}
              />
              
              {/* RESULTS SECTION */}
              <div className="flex-1 min-h-0 relative bg-bg overflow-hidden flex flex-col">
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
