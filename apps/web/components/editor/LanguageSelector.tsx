'use client';

import * as Select from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
] as const;

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  const current = LANGUAGES.find((l) => l.id === value) ?? LANGUAGES[0];

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-primary outline-none hover:border-accent/40',
          className
        )}
      >
        <span>{current.icon}</span>
        <Select.Value>{current.name}</Select.Value>
        <Select.Icon>
          <ChevronDown className="h-3 w-3 text-text-muted" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[160px] glass rounded-xl border border-border p-1 shadow-card animate-fade-in-down"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {LANGUAGES.map((lang) => (
              <Select.Item
                key={lang.id}
                value={lang.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-primary hover:bg-surface-2 cursor-pointer outline-none data-[highlighted]:bg-surface-2"
              >
                <Select.ItemText>
                  <span className="flex items-center gap-2">
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                  </span>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export { LANGUAGES };
