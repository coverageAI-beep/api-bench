import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { loader, OnMount, BeforeMount } from '@monaco-editor/react';
import {
  Check,
  AlertCircle,
  Sparkles,
  Copy,
  FileCode,
  Loader2
} from 'lucide-react';

interface JsonCodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  readOnly?: boolean;
}

const THEME_WARM_LIGHT = 'apibench-earth-warm';

// Register global Warm Pastel Earth theme in Monaco
const configureMonacoTheme = (monaco: any) => {
  monaco.editor.defineTheme(THEME_WARM_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: 'B85344', fontStyle: 'bold' }, // Terracotta key
      { token: 'type.property-name.json', foreground: 'B85344', fontStyle: 'bold' },
      { token: 'property', foreground: 'B85344', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '2E6B3E' }, // Sage Green string
      { token: 'string.json', foreground: '2E6B3E' },
      { token: 'string', foreground: '2E6B3E' },
      { token: 'number.json', foreground: 'A06818' }, // Baked Ochre number
      { token: 'number', foreground: 'A06818' },
      { token: 'keyword.json', foreground: '385C7D', fontStyle: 'bold' }, // River Denim boolean / null
      { token: 'keyword', foreground: '385C7D', fontStyle: 'bold' },
      { token: 'constant.language.json', foreground: '385C7D', fontStyle: 'bold' },
      { token: 'delimiter.bracket.json', foreground: '78716C' }, // Bark Stone Delimiters
      { token: 'delimiter.array.json', foreground: '78716C' },
      { token: 'delimiter.colon.json', foreground: '78716C' },
      { token: 'delimiter.comma.json', foreground: '78716C' },
      { token: 'delimiter', foreground: '78716C' },
    ],
    colors: {
      'editor.background': '#FAF8F5', // Warm Cream Paper
      'editor.foreground': '#292524', // Warm Charcoal / Espresso
      'editorLineNumber.foreground': '#A8A29E', // Subtle Stone
      'editorLineNumber.activeForeground': '#B85344', // Active Terracotta line
      'editorGutter.background': '#F4EFEA', // Gentle gutter
      'editor.lineHighlightBackground': '#F0EBE3', // Subtle line highlight
      'editor.selectionBackground': '#C26D5333', // Soft Terracotta selection
      'editorCursor.foreground': '#B85344', // Terracotta cursor
      'editorIndentGuide.background': '#E6DFD5',
      'editorIndentGuide.activeBackground': '#B85344',
      'editorWidget.background': '#FFFFFF',
      'editorWidget.border': '#E3DDD3',
    },
  });

  // Enable JSON schema diagnostics
  if (monaco.languages?.json?.jsonDefaults) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });
  }
};

// Global eager loader initialization
if (typeof window !== 'undefined') {
  loader.init().then((monaco) => {
    configureMonacoTheme(monaco);
  }).catch(() => {
    // Ignore fallback
  });
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  label,
  height = '180px',
  readOnly = false,
}) => {
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  // Validate JSON string
  useEffect(() => {
    if (!value || !value.trim()) {
      setIsValidJson(null);
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(value);
      setIsValidJson(true);
      setJsonError(null);
    } catch (err: any) {
      setIsValidJson(false);
      const msg = err.message?.replace(/^JSON\.parse: /, '') || 'Invalid JSON syntax';
      setJsonError(msg);
    }
  }, [value]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    configureMonacoTheme(monaco);
    monaco.editor.setTheme(THEME_WARM_LIGHT);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.setTheme(THEME_WARM_LIGHT);

    // Initial format if valid JSON
    if (value && value.trim()) {
      try {
        JSON.parse(value);
        setTimeout(() => {
          editor.getAction('editor.action.formatDocument')?.run();
        }, 100);
      } catch {
        // Keep as-is if invalid
      }
    }
  };

  // Format JSON handler
  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    } else if (value && value.trim() && onChange) {
      try {
        const parsed = JSON.parse(value);
        onChange(JSON.stringify(parsed, null, 2));
      } catch {}
    }
  }, [value, onChange]);

  // Copy to clipboard
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auto-format on blur if JSON is valid
  const handleContainerBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node) && onChange && value && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        if (formatted !== value) {
          onChange(formatted);
        }
      } catch {
        // Keep as is if invalid JSON
      }
    }
  };

  return (
    <div
      onBlur={handleContainerBlur}
      className="rounded-xl overflow-hidden border border-[#E3DDD3] bg-[#FAF8F5] text-[#292524] shadow-xs transition-all focus-within:ring-2 focus-within:ring-[#C26D53]/70 focus-within:border-[#C26D53]"
    >
      {/* Editor Header Toolbar: Clean, pastel earth palette with Format and Copy only */}
      <div className="flex items-center justify-between px-3.5 py-2 select-none text-xs border-b border-[#E3DDD3] bg-[#F4EFEA] text-[#292524] transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider uppercase shrink-0">
            <FileCode className="w-3.5 h-3.5 text-[#C26D53]" />
            <span className="truncate">{label || 'JSON Payload'}</span>
          </div>

          {/* Validation Status Badge */}
          {isValidJson === true && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 border bg-[#E5EFE7] text-[#265937] border-[#C8DEC9]">
              <Check className="w-3 h-3" />
              <span>Valid JSON</span>
            </span>
          )}

          {isValidJson === false && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold max-w-[240px] truncate border shrink-0 bg-[#F9E7E4] text-[#8A372E] border-[#ECC4BE]"
              title={jsonError || ''}
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">{jsonError || 'Syntax Error'}</span>
            </span>
          )}
        </div>

        {/* Toolbar Action Buttons: Only Format & Copy */}
        <div className="flex items-center gap-2 shrink-0">
          {!readOnly && onChange && (
            <button
              type="button"
              onClick={handleFormat}
              disabled={isValidJson === false || !value?.trim()}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold border border-[#E3DDD3] bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#292524] shadow-2xs transition-colors disabled:opacity-40"
              title="Format JSON (Prettify with 2-space indentation)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CFA058]" />
              <span>Format</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!value?.trim()}
            className="p-1.5 rounded-md border border-[#E3DDD3] bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#78716C] hover:text-[#292524] shadow-2xs transition-colors disabled:opacity-40"
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#265937]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor Surface in Warm Earth Light Theme */}
      <div className="bg-[#FAF8F5]">
        <Editor
          height={height}
          language="json"
          theme={THEME_WARM_LIGHT}
          value={value}
          onChange={(val) => {
            if (onChange) onChange(val || '');
          }}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          loading={
            <div className="h-40 flex items-center justify-center gap-2 text-xs font-mono bg-[#FAF8F5] text-[#78716C]">
              <Loader2 className="w-4 h-4 animate-spin text-[#C26D53]" />
              <span>Initializing Monaco Code Editor...</span>
            </div>
          }
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12.5,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: 'on',
            readOnly,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            contextmenu: false,
            padding: { top: 6, bottom: 6 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Inline Error Footer Banner */}
      {isValidJson === false && jsonError && (
        <div className="px-3.5 py-1.5 border-t border-[#ECC4BE] bg-[#FDF2F0] text-[11px] font-mono text-[#8A372E] flex items-center gap-2">
          <AlertCircle className="w-3 h-3 shrink-0 text-[#8A372E]" />
          <span className="truncate">{jsonError}</span>
        </div>
      )}
    </div>
  );
};
