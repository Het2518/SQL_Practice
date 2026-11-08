import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { format } from 'sql-formatter';
import { DB_INFO } from '@/data/schemas';
import { sqlKeywords } from '@/data/sqlKeywords';
import { loadShortcuts, comboToMonaco } from '@/utils/shortcutManager';
import { useEvent } from '@/hooks/useEvent';

const handleEditorWillMount = monaco => {
  // Define modern Linear/GitHub developer themes
  monaco.editor.defineTheme('datadesk-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0969da', fontStyle: 'bold' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: 'cf222e' },
      { token: 'identifier', foreground: '1f2328' },
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'operator', foreground: '0550ae' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1f2328',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorLineNumber.foreground': '#8c959f',
      'editorLineNumber.activeForeground': '#1f2328',
      'editorCursor.foreground': '#0969da',
      'editor.selectionBackground': '#b6e3ff40'
    }
  });

  monaco.editor.defineTheme('datadesk-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '79c0ff', fontStyle: 'bold' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: 'ff7b72' },
      { token: 'identifier', foreground: 'c9d1d9' },
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'operator', foreground: '79c0ff' }
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b2280',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#f0f6fc',
      'editorCursor.foreground': '#58a6ff',
      'editor.selectionBackground': '#388bfd33'
    }
  });

  // Backward compatibility aliases
  monaco.editor.defineTheme('earthy-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#ffffff' }
  });
  monaco.editor.defineTheme('earthy-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#0d1117' }
  });
};

export const SqlEditor = React.memo(function SqlEditor({
  value,
  onChange,
  onRun,
  disabled,
  dbName,
  fontSize = 14,
  autoComplete = true,
  darkMode = false,
  readOnly = false,
  customSchema = null,
  headerActions,
  isProctored = false
}) {
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
  
  // Use stable event handlers to prevent stale closures without re-triggering effects
  const stableOnRun = useEvent(() => {
    if (!disabled) onRun();
    return null;
  });
  
  const stableOnChange = useEvent(onChange);
  
  const stableFormat = useEvent(() => {
    try {
      const formatted = format(value, {
        language: 'sqlite',
        tabWidth: 2,
        keywordCase: 'upper'
      });
      onChange(formatted);
    } catch {
      // ignore formatting errors
    }
    return null;
  });

  const [shortcuts, setShortcuts] = useState(() => loadShortcuts());
  // Listen for shortcut changes across the app
  useEffect(() => {
    const handleShortcutUpdate = () => {
      setShortcuts(loadShortcuts());
    };
    const handleStorage = (e) => {
      if (e.key === 'sql-practice-shortcuts') setShortcuts(loadShortcuts());
    };
    window.addEventListener('sql-practice-shortcuts-updated', handleShortcutUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('sql-practice-shortcuts-updated', handleShortcutUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);



  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoInstance(monaco);

    // Bind shortcuts using the stable event handlers
    editor?.addCommand(comboToMonaco(shortcuts.runQuery.combo, monaco), stableOnRun);
    editor?.addCommand(comboToMonaco(shortcuts.formatCode.combo, monaco), stableFormat);
  }, [shortcuts.runQuery.combo, shortcuts.formatCode.combo, stableOnRun, stableFormat]);

  // Register SQL autocomplete for tables, columns, functions, and keywords
  useEffect(() => {
    if (!monacoInstance || autoComplete === false) return;

    // Resolve which schema to use: custom upload takes priority over built-in dbName
    let schemaTables = [];
    if (customSchema && Array.isArray(customSchema) && customSchema.length > 0) {
      schemaTables = customSchema;
    } else if (dbName && DB_INFO[dbName]) {
      schemaTables = DB_INFO[dbName].tables || [];
    }

    const disposable = monacoInstance.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        if (!model) return { suggestions: [] };
        const lineContent = model.getLineContent(position.lineNumber) || '';
        const textBeforeCursor = lineContent.substring(0, Math.max(0, position.column - 1));
        const word = model.getWordUntilPosition(position) || {
          word: '',
          startColumn: position.column,
          endColumn: position.column,
        };
        
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn || position.column,
          endColumn: word.endColumn || position.column,
        };

        const suggestions = [];

        // 1. Table prefix detection: e.g. "patients." or "p."
        const dotMatch = textBeforeCursor.match(/([a-zA-Z0-9_]+)\.$/);
        if (dotMatch) {
          const targetName = dotMatch[1].toLowerCase();
          const targetTable = schemaTables.find(
            (t) => t.name.toLowerCase() === targetName
          );
          if (targetTable) {
            (targetTable.columns || []).forEach((col) => {
              const colName = typeof col === 'string' ? col : col.name;
              const colType = typeof col === 'object' ? col.type : 'TEXT';
              const isPk = typeof col === 'object' ? col.pk : false;
              suggestions.push({
                label: colName,
                kind: monacoInstance.languages.CompletionItemKind.Field,
                insertText: colName,
                detail: `${colType} — ${targetTable.name}${isPk ? ' 🔑 (PK)' : ''}`,
                sortText: `0_${colName}`,
                range,
              });
            });
            return { suggestions };
          }
        }

        // 2. Tables from active schema
        schemaTables.forEach((table) => {
          suggestions.push({
            label: table.name,
            kind: monacoInstance.languages.CompletionItemKind.Struct,
            insertText: table.name,
            detail: `Table${table.rowCount != null ? ` (${table.rowCount.toLocaleString()} rows)` : ''}`,
            documentation: `Columns: ${(table.columns || [])
              .map((c) => (typeof c === 'string' ? c : c.name))
              .join(', ')}`,
            sortText: `1_${table.name}`,
            range,
          });

          // 3. Columns from all schema tables
          (table.columns || []).forEach((col) => {
            const colName = typeof col === 'string' ? col : col.name;
            const colType = typeof col === 'object' ? col.type : 'TEXT';
            const isPk = typeof col === 'object' ? col.pk : false;
            suggestions.push({
              label: colName,
              kind: monacoInstance.languages.CompletionItemKind.Field,
              insertText: colName,
              detail: `${colType} — ${table.name}${isPk ? ' 🔑' : ''}`,
              sortText: `2_${colName}`,
              range,
            });
          });
        });

        // 4. SQL Functions with interactive snippets
        const sqlFunctions = [
          { name: 'COUNT', snippet: 'COUNT(${1:*})', desc: 'Count rows' },
          { name: 'SUM', snippet: 'SUM(${1:column})', desc: 'Sum values' },
          { name: 'AVG', snippet: 'AVG(${1:column})', desc: 'Average values' },
          { name: 'MIN', snippet: 'MIN(${1:column})', desc: 'Minimum value' },
          { name: 'MAX', snippet: 'MAX(${1:column})', desc: 'Maximum value' },
          { name: 'ROUND', snippet: 'ROUND(${1:column}, ${2:2})', desc: 'Round number' },
          { name: 'COALESCE', snippet: 'COALESCE(${1:column}, ${2:default})', desc: 'First non-null value' },
          { name: 'DENSE_RANK', snippet: 'DENSE_RANK() OVER (ORDER BY ${1:column})', desc: 'Dense rank window function' },
          { name: 'RANK', snippet: 'RANK() OVER (ORDER BY ${1:column})', desc: 'Rank window function' },
          { name: 'ROW_NUMBER', snippet: 'ROW_NUMBER() OVER (ORDER BY ${1:column})', desc: 'Row number window function' },
          { name: 'DATE', snippet: 'DATE(${1:date_string})', desc: 'Parse date' },
          { name: 'STRFTIME', snippet: "STRFTIME('${1:%Y-%m}', ${2:date_col})", desc: 'Format date' },
          { name: 'LENGTH', snippet: 'LENGTH(${1:column})', desc: 'String length' },
          { name: 'UPPER', snippet: 'UPPER(${1:column})', desc: 'Uppercase string' },
          { name: 'LOWER', snippet: 'LOWER(${1:column})', desc: 'Lowercase string' },
          { name: 'CONCAT', snippet: 'CONCAT(${1:col1}, ${2:col2})', desc: 'Concatenate strings' },
          { name: 'SUBSTR', snippet: 'SUBSTR(${1:column}, ${2:start}, ${3:length})', desc: 'Substring' },
        ];

        sqlFunctions.forEach((fn) => {
          suggestions.push({
            label: fn.name,
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: fn.snippet,
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: `SQL Function: ${fn.desc}`,
            sortText: `3_${fn.name}`,
            range,
          });
        });

        // 5. Common SQL Keywords
        sqlKeywords.forEach((kw) => {
          suggestions.push({
            label: kw,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: kw,
            detail: 'SQL Keyword',
            sortText: `4_${kw}`,
            range,
          });
        });

        return { suggestions };
      },
    });

    return () => {
      try {
        disposable.dispose();
      } catch (e) {
        // Safe disposal
      }
    };
  }, [monacoInstance, dbName, autoComplete, customSchema]);

  const editorOptions = useMemo(
    () => ({
      readOnly: readOnly,
      fontSize: fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      contextmenu: !isProctored,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      padding: { top: 16, bottom: 16 },
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showWords: true,
        showFunctions: true,
        showFields: true,
        showStructs: true,
        localityBonus: true,
        preview: true,
        shareSuggestSelections: true,
      },
    }),
    [readOnly, fontSize]
  );

  return (
    <div className="h-full w-full min-w-0 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-surface border-b border-border text-[11px] text-muted font-sans">
        <span className="flex items-center gap-1">
          <kbd className="bg-bg border border-border rounded px-1.5 py-[1px] text-[10px] text-primary">
            Ctrl+Enter
          </kbd>
          <span>Run</span>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <kbd className="bg-bg border border-border rounded px-1.5 py-[1px] text-[10px] text-primary">
            Ctrl+Q
          </kbd>
          <span>Format</span>
        </span>
        <div className="flex-1" />
        <button
          onClick={stableFormat}
          className="px-2 py-0.5 hover:bg-surface-2 text-text rounded text-[11px] transition-colors"
        >
          Format
        </button>
        {headerActions}
      </div>
      <div className="flex-1 min-h-0 relative w-full h-full">
        <Editor
          height="100%"
          language="sql"
          value={value}
          onChange={v => {
            if (v !== undefined) {
              stableOnChange(v);
            }
          }}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          theme={darkMode ? 'datadesk-dark' : 'datadesk-light'}
          options={editorOptions}
        />
      </div>
    </div>
  );
});