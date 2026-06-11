'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full bg-surface animate-pulse" />,
});

const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
};

interface CodeEditorProps {
  value: string;
  language: string;
  theme: 'vs-dark' | 'light';
  fontSize: number;
  tabSize?: number;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  language,
  theme,
  fontSize,
  tabSize = 2,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const monacoLanguage = useMemo(
    () => LANGUAGE_MAP[language] ?? 'javascript',
    [language]
  );

  return (
    <MonacoEditor
      height="100%"
      language={monacoLanguage}
      theme={theme}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        roundedSelection: true,
        cursorBlinking: 'smooth',
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        fontLigatures: true,
        contextmenu: false,
        fontSize,
        tabSize,
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
      }}
    />
  );
}
