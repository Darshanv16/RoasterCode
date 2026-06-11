import { useEffect } from 'react';

interface KeyboardShortcutCallbacks {
  onSubmit: () => void;
  onRun: () => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts({
  onSubmit,
  onRun,
  onCloseModal,
}: KeyboardShortcutCallbacks) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
        return;
      }

      if (mod && e.key === 'r') {
        e.preventDefault();
        onRun();
        return;
      }

      if (e.key === 'Escape' && onCloseModal) {
        onCloseModal();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSubmit, onRun, onCloseModal]);
}
