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
  ListOrdered,
  CheckCircle2,
} from 'lucide-react';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { ResultsPanel } from '@/features/practice/ResultsPanel';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { groqChat, buildSandboxQuestionsPrompt, MODEL_FAST, generateSchema, safeParseJsonArray, generateFallbackSchemaQuestions, hasGroqKey } from '@/lib/groq';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';

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
      if (s.has(name)) {
        s.delete(name);
      } else {
        s.add(name);
      }
      return s;
    });

  return (
    <aside className="w-[230px] border-r border-border bg-surface flex flex-col min-h-0 shrink-0 select-none">
      {/* Header */}
      <div className="h-[42px] px-3.5 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-semibold text-xs text-text">
          <Database size={14} className="text-primary" />
          <span>Dataset</span>
        </div>
        {schema && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-muted">
            {schema.length} table{schema.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tab row */}
      <div className="h-[34px] px-3 bg-surface-2 border-b border-border flex items-center shrink-0">
        <span className="text-xs font-semibold text-text">Schema</span>
      </div>

      {/* Tables */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {!schema?.length && (
          <div className="px-4 py-6 text-center text-muted text-xs leading-relaxed">
            Upload a CSV or SQLite file to explore schema here.
          </div>
        )}

        {schema?.length > 0 && (
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted tracking-wider uppercase">
            Tables
          </div>
        )}

        {schema?.map((table) => {
          const isOpen = expanded.has(table.name);
          return (
            <div key={table.name} className="border-b border-border/50 last:border-b-0">
              <div
                className="flex items-center gap-1.5 px-3 py-2 cursor-pointer hover:bg-surface-2 transition-colors group"
                onClick={() => toggle(table.name)}
              >
                <ChevronRight
                  size={12}
                  className={`text-muted group-hover:text-text transition-transform duration-150 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
                <span className="text-xs font-semibold text-text truncate flex-1 font-mono">
                  {table.name}
                </span>
                <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                  {(table.rowCount || 0).toLocaleString()}
                </span>
              </div>
              {isOpen && (
                <div className="bg-bg py-1 border-t border-border/50">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 px-4 py-1 text-xs hover:bg-surface-2 cursor-pointer font-mono group"
                      onClick={() => onInsert(col.name)}
                      title={`Insert "${col.name}"`}
                    >
                      {col.pk ? (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          PK
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted font-bold">#</span>
                      )}
                      <span className="text-text group-hover:text-primary flex-1 truncate">
                        {col.name}
                      </span>
                      <span className="text-[10px] text-muted uppercase">{col.type}</span>
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
  const hasKey = hasGroqKey();

  const generate = useCallback(
    async (batchIndex) => {
      if (!schema?.length) return;
      setLoading(true);
      setError(null);
      try {
        const messages = buildSandboxQuestionsPrompt({ schema, sampleData, batch: batchIndex });
        const raw = await groqChat(messages, MODEL_FAST, 2500, false);
        const parsed = safeParseJsonArray(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No questions returned.');
        setQuestions(parsed.slice(0, 5));
        setBatch(batchIndex + 1);
        setSelected(null);
      } catch (err) {
        console.warn('[CustomDataset] AI generation error, using fallback schema questions:', err.message);
        // Fallback to schema questions so user always gets actionable challenges
        const fallbackQs = generateFallbackSchemaQuestions(schema);
        if (fallbackQs && fallbackQs.length > 0) {
          setQuestions(fallbackQs);
          setBatch(batchIndex + 1);
          setSelected(null);
        } else {
          setError(
            err.message === 'NO_KEY' || err.message === 'MISSING_API_KEY'
              ? 'no_key'
              : err.message === 'RATE_LIMIT'
                ? 'rate_limit'
                : err.message
          );
        }
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
      <div className="w-10 border-l border-border bg-surface flex flex-col items-center py-3 shrink-0">
        <button
          className="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-text transition-colors"
          onClick={onToggle}
          title="Show Questions"
        >
          <PanelRightOpen size={16} />
        </button>
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="w-[340px] border-l border-border bg-surface flex flex-col min-h-0 shrink-0">
        {/* Header row: All Questions nav */}
        <div className="h-[42px] px-3 border-b border-border bg-surface-2 flex items-center justify-between shrink-0">
          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text transition-colors"
            onClick={() => setSelected(null)}
          >
            <ListOrdered size={13} /> All Questions
          </button>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded text-xs text-muted hover:text-text disabled:opacity-40"
              onClick={() => goTo(-1)}
              disabled={qIndex <= 0}
            >
              ←
            </button>
            <span className="text-[11px] font-mono text-muted">
              {qIndex + 1} / {questions.length}
            </span>
            <button
              className="p-1 rounded text-xs text-muted hover:text-text disabled:opacity-40"
              onClick={() => goTo(1)}
              disabled={qIndex >= questions.length - 1}
            >
              →
            </button>
          </div>
          <button
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-3 transition-colors"
            onClick={onToggle}
            title="Hide panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={selected.difficulty}>{selected.difficulty}</Badge>
            <span className="text-[11px] text-muted">○ Challenge</span>
          </div>

          <div className="text-xs text-text leading-relaxed space-y-2">
            {(selected.prompt || '').split('\n').map((line, i) => (
              <p key={i} className="m-0">
                {line}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
              {selected.topic}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
              MAANG
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text mb-1">
              <Sparkles size={12} className="text-brand" /> Hint
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">
              Write SQL in the editor. Press{' '}
              <kbd className="px-1 py-0.5 text-[10px] bg-bg border border-border rounded font-mono">
                Ctrl+Enter
              </kbd>{' '}
              to run.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[42px] px-3 border-t border-border bg-surface-2 flex items-center justify-between text-[11px] text-muted shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-brand" /> Groq AI
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
    <div className="w-[340px] border-l border-border bg-surface flex flex-col min-h-0 shrink-0">
      {/* Header */}
      <div className="h-[42px] px-3 border-b border-border bg-surface-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
          <Sparkles size={13} className="text-brand" /> AI Questions
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand/10 text-brand">
            MAANG
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {!loading && questions.length > 0 && (
            <button
              className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-3 transition-colors"
              onClick={() => generate(batch)}
            >
              <RefreshCw size={11} /> Next 5
            </button>
          )}
          {loading && (
            <RotateCcw size={12} className="animate-spin text-muted" />
          )}
          <button
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-3 transition-colors"
            onClick={onToggle}
            title="Hide panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>
      </div>

      {/* List body */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {!hasKey && (
          <div className="m-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              Add your <strong>Groq API key</strong> in Settings to enable AI questions.
            </div>
          </div>
        )}

        {hasKey &&
          loading &&
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="p-3 space-y-2">
              <div className="h-2.5 bg-surface-3 rounded w-1/3 animate-pulse" />
              <div className="h-3.5 bg-surface-2 rounded w-4/5 animate-pulse" />
            </div>
          ))}

        {hasKey && !loading && error && (
          <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-error flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div>
                {error === 'rate_limit'
                  ? 'Rate limit — wait a moment.'
                  : error === 'no_key'
                    ? 'Add Groq API key.'
                    : error}
              </div>
              <button
                className="text-xs font-semibold underline hover:no-underline"
                onClick={() => generate(batch)}
              >
                ↺ Retry
              </button>
            </div>
          </div>
        )}

        {hasKey && !loading && !error && questions.length === 0 && (
          <div className="p-8 text-center space-y-3">
            <Sparkles size={24} className="mx-auto text-brand" />
            <div className="font-semibold text-sm text-text">No questions yet</div>
            <div className="text-xs text-muted max-w-[220px] mx-auto">
              Generate 5 MAANG-style SQL questions for your dataset.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => generate(0)}
              className="mt-2"
            >
              Generate Questions
            </Button>
          </div>
        )}

        {hasKey &&
          !loading &&
          !error &&
          questions.map((q, i) => (
            <div
              key={`${batch}-${i}`}
              className="p-3 hover:bg-surface-2 cursor-pointer transition-colors flex items-start gap-2.5 group"
              onClick={() => openQuestion(q, i)}
            >
              <span className="text-xs font-mono font-bold text-muted group-hover:text-text mt-0.5">
                {i + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text truncate mb-1 group-hover:text-primary">
                  {q.title}
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                  <span className="text-muted truncate">{q.topic}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted group-hover:text-text mt-0.5 shrink-0" />
            </div>
          ))}
      </div>

      {/* Footer */}
      {hasKey && questions.length > 0 && !loading && (
        <div className="h-[42px] px-3 border-t border-border bg-surface-2 flex items-center justify-between text-[11px] text-muted shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-brand" /> Groq AI · Click to load
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
      <div className="h-10 px-3 bg-surface border-b border-border flex items-center gap-2 overflow-x-auto shrink-0">
        <div className="flex gap-1.5 flex-1 items-center overflow-x-auto">
          {schema.map((t) => (
            <span
              key={t.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-border text-xs text-text font-mono shrink-0"
            >
              <Database size={12} className="text-primary" />
              <span>{t.name}</span>
              <span className="text-[10px] text-muted">
                ({(t.rowCount || 0).toLocaleString()} rows)
              </span>
            </span>
          ))}
          {uploadStatus?.type === 'success' && (
            <span className="text-[11px] text-success font-semibold flex items-center gap-1 ml-1 shrink-0">
              <CheckCircle2 size={12} /> Loaded
            </span>
          )}
        </div>
        <button
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md hover:bg-surface-2 text-text transition-colors shrink-0 border border-border"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={12} /> Add
        </button>
        <button
          className="flex items-center gap-1 text-xs text-error px-2.5 py-1 rounded-md hover:bg-surface-2 transition-colors shrink-0 border border-border hover:border-error/40"
          onClick={onReset}
        >
          <Trash2 size={12} /> Clear
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
    <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full w-full">
      {/* ── LEFT PANEL: Hero Overview ── */}
      <div className="flex-1 bg-surface text-text p-8 md:p-14 flex flex-col justify-center relative overflow-hidden border-r border-border">
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-border bg-surface-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Database size={13} className="text-primary" /> Custom Sandbox
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-text">
            Bring Your Own Data
          </h1>

          <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed max-w-md">
            Practice real SQL against your data instantly. Upload CSV or SQLite files, and let our AI generate MAANG-level questions tailored to your schema.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                <Database size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text text-sm mb-0.5">Zero Latency SQLite</h4>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
                  Your database runs entirely in-browser using WebAssembly. No servers, no waiting.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                <Sparkles size={18} className="text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-text text-sm mb-0.5">AI-Generated Interviews</h4>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
                  We automatically analyze your schema and generate complex, real-world questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: File Drag & Drop ── */}
      <div className="flex-1 bg-bg flex flex-col justify-center items-center p-8 md:p-12 relative overflow-y-auto">
        {/* Upload Zone */}
        <div
          className={`w-full max-w-[500px] rounded-2xl p-8 border-2 border-dashed transition-all duration-200 cursor-pointer text-center bg-surface ${
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-text-secondary hover:bg-surface-2'
          }`}
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
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <RefreshCw size={26} className="animate-spin text-primary" />
            ) : (
              <Upload size={26} className="text-primary" />
            )}
          </div>
          <h3 className="text-lg font-bold text-text mb-1.5">
            {dragOver ? 'Drop files here' : uploading ? 'Processing your data...' : 'Upload Datasets'}
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {uploading ? 'Parsing files in-memory...' : 'Drag & drop or click to browse .csv, .sqlite, .db files'}
          </p>

          {!uploading && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 bg-surface-2 rounded-full border border-border text-muted">
              <Database size={12} className="text-primary" /> Multiple CSVs = Multiple tables
            </div>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus && (
          <div
            className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              uploadStatus.type === 'error'
                ? 'bg-error/10 text-error border border-error/20'
                : 'bg-success/10 text-success border border-success/20'
            }`}
          >
            {uploadStatus.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {uploadStatus.message}
          </div>
        )}

        {/* AI Generate Section */}
        <div className="mt-8 w-full max-w-[500px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Or generate with AI</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="bg-surface p-2 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 px-2">
              <Sparkles size={16} className="text-brand shrink-0" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. An airline reservation database..."
                className="flex-1 bg-transparent border-none text-text text-xs outline-none placeholder:text-muted"
                onKeyDown={(e) =>
                  e.key === 'Enter' && !generatingSchema && aiPrompt.trim() && onAiGenerate(aiPrompt)
                }
                disabled={generatingSchema || uploading}
              />
            </div>
            <Button
              onClick={() => onAiGenerate(aiPrompt)}
              disabled={!aiPrompt.trim() || generatingSchema || uploading}
              variant="primary"
              size="sm"
            >
              {generatingSchema ? <RefreshCw size={13} className="animate-spin mr-1.5" /> : null}
              {generatingSchema ? 'Generating...' : 'Build Sandbox'}
            </Button>
          </div>
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
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-bg text-text" data-theme={darkMode ? 'dark' : 'light'}>
      {/* ── Nav ── */}
      <nav className="h-[48px] px-4 bg-surface border-b border-border flex items-center gap-3 shrink-0 z-20">
        <button
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
          onClick={() => navigate('/')}
        >
          <Home size={15} /> Home
        </button>

        <div className="flex items-center gap-2">
          <Database size={15} className="text-primary" />
          <span className="font-bold text-sm text-text">
            Custom Dataset
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
            Sandbox
          </span>
        </div>

        {/* Center space */}
        <div className="flex-1" />

        {!qPanelVisible && hasData && (
          <button
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md hover:bg-surface-2 transition-colors text-text"
            onClick={() => setQPanelVisible(true)}
          >
            <Sparkles size={13} className="text-brand" /> AI Questions
          </button>
        )}

        <button
          className="p-1.5 rounded-md text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
          onClick={onToggleDark}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* ── Main Workspace ── */}
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

          {/* ── 3-Pane IDE Layout: Schema | Editor+Results | Questions ── */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
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
                <div className="h-[40px] px-3 bg-surface-2 border-t border-border flex items-center justify-between shrink-0">
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
                className={`h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10 shrink-0 ${
                  isDragging ? 'bg-primary/30' : 'bg-transparent'
                }`}
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
