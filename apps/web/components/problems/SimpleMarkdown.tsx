'use client';

import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function SimpleMarkdown({ content }: { content: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-sm text-text-muted leading-relaxed space-y-3">
      {blocks.map((block, i) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const inner = block.slice(3, -3).replace(/^\w*\n/, '');
          return (
            <pre
              key={i}
              className="rounded-lg bg-surface-2 p-3 text-xs font-mono text-text-primary overflow-x-auto"
            >
              {inner.trim()}
            </pre>
          );
        }

        return block.split('\n').map((line, j) => {
          const trimmed = line.trim();
          if (!trimmed) return <br key={`${i}-${j}`} />;
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={`${i}-${j}`} className="ml-4 list-disc">
                {renderInline(trimmed.slice(2))}
              </li>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <li key={`${i}-${j}`} className="ml-4 list-decimal">
                {renderInline(trimmed.replace(/^\d+\.\s/, ''))}
              </li>
            );
          }
          return <p key={`${i}-${j}`}>{renderInline(line)}</p>;
        });
      })}
    </div>
  );
}
