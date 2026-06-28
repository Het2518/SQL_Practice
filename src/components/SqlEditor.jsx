import { useRef, useEffect, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import { format } from 'sql-formatter';
import { DB_INFO } from '../types';
import { sqlKeywords } from '../data/sqlKeywords';
export function SqlEditor({
  value,
  onChange,
  onRun,
  disabled,
  dbName,
  fontSize = 14,
  autoComplete = true,
  darkMode = false,
}) {
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
  const handleFormat = useCallback(() => {
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
  }, [value, onChange]);
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoInstance(monaco);

    // Ctrl+Enter → Run
    editor?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!disabled) onRun();
    });

    // Ctrl+Q → Format
    editor?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ, () => {
      handleFormat();
    });
  }, [disabled, onRun, handleFormat]);

  // Update Ctrl+Enter handler when deps change
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.addCommand(monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.Enter, () => {
        if (!disabled) onRun();
      });
    }
  }, [disabled, onRun]);

  // Register SQL autocomplete for tables and columns (only if enabled)
  useEffect(() => {
    if (!monacoInstance || !dbName || !autoComplete) return;
    const dbInfo = DB_INFO[dbName];
    if (!dbInfo) return;
    const disposable = monacoInstance.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [];

        // Tables
        dbInfo.tables.forEach(table => {
          suggestions.push({
            label: table.name,
            kind: monacoInstance.languages.CompletionItemKind.Struct,
            insertText: table.name,
            detail: 'Table',
            range
          });
          // Columns
          table.columns.forEach(col => {
            suggestions.push({
              label: col.name,
              kind: monacoInstance.languages.CompletionItemKind.Field,
              insertText: col.name,
              detail: `Column (${table.name})`,
              range
            });
          });
        });

        // Common SQL Keywords
        sqlKeywords.forEach(kw => {
          suggestions.push({
            label: kw,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: kw,
            detail: 'Keyword',
            range
          });
        });
        return {
          suggestions
        };
      }
    });
    return () => disposable.dispose();
  }, [monacoInstance, dbName, autoComplete]);
  const handleEditorWillMount = monaco => {
    monaco.editor.defineTheme('earthy-light', {
      base: 'vs',
      inherit: true,
      rules: [{
        token: 'keyword',
        foreground: 'AB886D',
        fontStyle: 'bold'
      }, {
        token: 'string',
        foreground: '9A887A'
      }, {
        token: 'number',
        foreground: 'AB886D'
      }, {
        token: 'identifier',
        foreground: '493628'
      }, {
        token: 'comment',
        foreground: 'D6C0B3',
        fontStyle: 'italic'
      }, {
        token: 'operator',
        foreground: 'AB886D'
      }],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#493628',
        'editor.lineHighlightBackground': '#F5F2F0',
        'editorLineNumber.foreground': '#D6C0B3',
        'editorLineNumber.activeForeground': '#AB886D',
        'editorCursor.foreground': '#AB886D',
        'editor.selectionBackground': '#E4E0E1'
      }
    });

    monaco.editor.defineTheme('earthy-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [{
        token: 'keyword',
        foreground: 'C4AFA7',
        fontStyle: 'bold'
      }, {
        token: 'string',
        foreground: '8A7268'
      }, {
        token: 'number',
        foreground: 'C4AFA7'
      }, {
        token: 'identifier',
        foreground: 'F0EBE8'
      }, {
        token: 'comment',
        foreground: '6B5548',
        fontStyle: 'italic'
      }, {
        token: 'operator',
        foreground: 'C4AFA7'
      }],
      colors: {
        'editor.background': '#2A2421',
        'editor.foreground': '#F0EBE8',
        'editor.lineHighlightBackground': '#322C29',
        'editorLineNumber.foreground': '#6B5548',
        'editorLineNumber.activeForeground': '#C4AFA7',
        'editorCursor.foreground': '#C4AFA7',
        'editor.selectionBackground': '#3D342F'
      }
    });
  };
  return <div style={{
    height: '100%',
    width: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      fontSize: 11,
      color: 'var(--muted)',
      fontFamily: 'var(--font-sans)'
    }}>
        <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
          <kbd style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: '1px 5px',
          fontSize: 10,
          color: 'var(--primary)'
        }}>Ctrl+Enter</kbd>
          <span>Run</span>
        </span>
        <span style={{
        color: 'var(--border)'
      }}>·</span>
        <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
          <kbd style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: '1px 5px',
          fontSize: 10,
          color: 'var(--primary)'
        }}>Ctrl+Q</kbd>
          <span>Format</span>
        </span>
        <div style={{
        flex: 1
      }} />
        <button onClick={handleFormat} className="btn btn-ghost" style={{
        padding: '2px 8px',
        fontSize: 11
      }}>
          ✨ Format
        </button>
      </div>
      <div style={{
      flex: 1
    }}>
        <Editor
          height="100%"
          language="sql"
          value={value}
          onChange={v => onChange(v ?? '')}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          theme={darkMode ? 'earthy-dark' : 'earthy-light'}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: autoComplete,
              showSnippets: autoComplete,
            },
            quickSuggestions: autoComplete ? {
              other: true,
              comments: false,
              strings: false,
            } : false,
          }}
        />
      </div>
    </div>;
}