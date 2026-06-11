'use client';

import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/editor/LanguageSelector';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Keyboard,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  theme: 'vs-dark' | 'light';
  onThemeToggle: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onReset: () => void;
}

const SHORTCUTS = [
  { keys: 'Ctrl/Cmd + Enter', action: 'Submit code' },
  { keys: 'Ctrl/Cmd + R', action: 'Run test cases' },
  { keys: 'Ctrl/Cmd + /', action: 'Toggle comment' },
  { keys: 'Esc', action: 'Close modal' },
];

export function EditorToolbar({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  onReset,
}: EditorToolbarProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-2 px-4">
      <LanguageSelector value={language} onChange={onLanguageChange} />

      <div className="flex items-center gap-1">
        <Dialog.Root open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <Dialog.Trigger asChild>
            <button
              title="Reset to starter code"
              className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 glass rounded-xl border border-border p-6 shadow-card">
              <Dialog.Title className="text-lg font-semibold text-text-primary mb-2">
                Reset code?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-muted mb-4">
                This will replace your current code with the starter template. Your draft will be
                lost.
              </Dialog.Description>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  magnetic={false}
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  magnetic={false}
                  onClick={() => {
                    onReset();
                    setShowResetConfirm(false);
                  }}
                >
                  Reset
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <button
          title="Toggle theme"
          onClick={onThemeToggle}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
        >
          {theme === 'vs-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          title="Decrease font size"
          onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
          disabled={fontSize <= 12}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-xs text-text-dim w-6 text-center">{fontSize}</span>
        <button
          title="Increase font size"
          onClick={() => onFontSizeChange(Math.min(20, fontSize + 1))}
          disabled={fontSize >= 20}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>

        <Dialog.Root open={showShortcuts} onOpenChange={setShowShortcuts}>
          <Dialog.Trigger asChild>
            <button
              title="Keyboard shortcuts"
              className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 glass rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold text-text-primary">
                  Keyboard Shortcuts
                </Dialog.Title>
                <Dialog.Close className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.keys}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span className="text-text-muted">{s.action}</span>
                    <kbd className="font-mono text-xs bg-surface-2 px-2 py-0.5 rounded border border-border text-text-primary">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
