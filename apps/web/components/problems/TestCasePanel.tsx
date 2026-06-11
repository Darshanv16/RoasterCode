'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';

export interface PublicTestCase {
  id: string;
  input: string;
  expected: string;
  order: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string;
  runtime: number | null;
  errorMessage?: string | null;
}

interface TestCasePanelProps {
  testCases: PublicTestCase[];
  runResults?: TestResult[] | null;
  customCases: Array<{ input: string }>;
  onAddCustomCase: (input: string) => void;
}

export function TestCasePanel({
  testCases,
  runResults,
  customCases,
  onAddCustomCase,
}: TestCasePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const allCases: PublicTestCase[] = [
    ...testCases,
    ...customCases.map((c, i) => ({
      id: `custom-${i}`,
      input: c.input,
      expected: '',
      order: testCases.length + i,
    })),
  ];

  const getResult = (id: string) => runResults?.find((r) => r.testCaseId === id);

  const handleAdd = () => {
    if (!customInput.trim()) return;
    onAddCustomCase(customInput.trim());
    setCustomInput('');
    setShowForm(false);
  };

  if (!runResults) {
    return (
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold tracking-wider text-text-dim px-1">
          <span>INPUT</span>
          <span>EXPECTED OUTPUT</span>
        </div>
        {allCases.map((tc, i) => (
          <div key={tc.id} className="grid grid-cols-2 gap-2">
            <pre className="rounded-lg bg-surface-2 p-2 text-xs font-mono text-text-primary whitespace-pre-wrap overflow-x-auto">
              {tc.input || `Case ${i + 1}`}
            </pre>
            <pre className="rounded-lg bg-surface-2 p-2 text-xs font-mono text-text-muted whitespace-pre-wrap overflow-x-auto">
              {tc.expected || '—'}
            </pre>
          </div>
        ))}
        {showForm ? (
          <div className="space-y-2 border border-border rounded-lg p-3">
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Custom test input..."
              className="w-full h-20 rounded-lg bg-surface-2 border border-border p-2 text-xs font-mono text-text-primary outline-none resize-none"
            />
            <div className="flex gap-2">
              <Button magnetic={false} className="text-xs py-1 px-3" onClick={handleAdd}>
                Add
              </Button>
              <Button
                variant="ghost"
                magnetic={false}
                className="text-xs py-1 px-3"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            magnetic={false}
            className="text-xs py-1 px-3 w-full"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3 w-3" /> Add custom test case
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {allCases.map((tc, i) => {
        const result = getResult(tc.id);
        const passed = result?.passed;
        const isCustom = tc.id.startsWith('custom-');

        return (
          <div
            key={tc.id}
            className={cn(
              'rounded-lg border p-3 text-xs',
              result
                ? passed
                  ? 'border-success/30 bg-success/5'
                  : isCustom
                    ? 'border-border bg-surface-2'
                    : 'border-danger/30 bg-danger/5'
                : 'border-border bg-surface-2'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {result && !isCustom ? (
                passed ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <X className="h-3.5 w-3.5 text-danger" />
                )
              ) : null}
              <span className="font-medium text-text-primary">Case {i + 1}</span>
              {result?.runtime != null && (
                <span className="text-text-dim ml-auto">{Math.round(result.runtime)}ms</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <p className="text-[10px] text-text-dim mb-1">Expected</p>
                <pre className="text-text-muted whitespace-pre-wrap">{tc.expected || '—'}</pre>
              </div>
              <div>
                <p className="text-[10px] text-text-dim mb-1">Got</p>
                <pre className="text-text-primary whitespace-pre-wrap">
                  {result?.actualOutput ?? result?.errorMessage ?? '—'}
                </pre>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
