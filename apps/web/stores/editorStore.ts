import { create } from 'zustand';

export type Language = 'python' | 'javascript';

interface EditorStore {
  code: string;
  language: Language;
  fontSize: number;
  isSubmitting: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setLanguageWithCode: (language: Language, code: string) => void;
  setFontSize: (size: number) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

const DEFAULT_CODE: Record<Language, string> = {
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
};

export const useEditorStore = create<EditorStore>((set) => ({
  code: DEFAULT_CODE.python,
  language: 'python',
  fontSize: 14,
  isSubmitting: false,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setLanguageWithCode: (language, code) => set({ language, code }),
  setFontSize: (fontSize) => set({ fontSize }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () =>
    set((s) => ({ code: DEFAULT_CODE[s.language], isSubmitting: false })),
}));
