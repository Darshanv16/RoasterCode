'use client';

import { DifficultyBadge } from '@/components/problems/DifficultyBadge';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminApi, problemsApi, type AdminProblemDetail, type CreateProblemPayload } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const LANGUAGES = ['python', 'javascript'] as const;
const XP_PRESETS = [50, 100, 200];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const emptyForm = (): CreateProblemPayload => ({
  title: '',
  statement: '',
  difficulty: 'EASY',
  tags: [],
  constraints: '',
  starterCode: { python: '', javascript: '' },
  hints: ['', '', ''],
  xpReward: 50,
  timeLimit: 2000,
  memoryLimit: 256,
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expected: '', isHidden: true }],
});

interface ProblemEditorProps {
  problemId?: string;
}

export function ProblemEditor({ problemId }: ProblemEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<CreateProblemPayload>(emptyForm());
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [activeLang, setActiveLang] = useState<string>('python');
  const [previewMd, setPreviewMd] = useState(false);
  const [loading, setLoading] = useState(!!problemId);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (!problemId) return;
    adminApi
      .getProblem(problemId)
      .then(({ data }) => {
        const p = data as AdminProblemDetail;
        setForm({
          title: p.title,
          statement: p.statement,
          difficulty: p.difficulty,
          tags: p.tags,
          constraints: p.constraints,
          starterCode: p.starterCode,
          hints: [...p.hints, '', '', ''].slice(0, 3),
          xpReward: p.xpReward,
          timeLimit: p.timeLimit,
          memoryLimit: p.memoryLimit,
          examples: p.examples.length
            ? p.examples.map((e) => ({
                input: e.input,
                output: e.output,
                explanation: e.explanation ?? '',
              }))
            : [{ input: '', output: '', explanation: '' }],
          testCases: p.testCases.map((tc) => ({
            input: tc.input,
            expected: tc.expected ?? '',
            isHidden: tc.isHidden ?? true,
          })),
        });
        setSlug(p.slug);
        setSlugEdited(true);
        setTagsInput(p.tags.join(', '));
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [problemId]);

  useEffect(() => {
    if (!slugEdited && form.title) {
      setSlug(slugify(form.title));
    }
  }, [form.title, slugEdited]);

  const update = <K extends keyof CreateProblemPayload>(key: K, value: CreateProblemPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim() || !form.statement.trim()) {
      toast.error('Title and statement are required');
      return;
    }

    setSaving(true);
    const payload: CreateProblemPayload = {
      ...form,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      hints: form.hints.filter(Boolean),
      examples: form.examples.filter((e) => e.input || e.output),
      testCases: form.testCases.filter((tc) => tc.input && tc.expected),
    };

    try {
      if (problemId) {
        await problemsApi.update(problemId, payload);
        if (publish) await problemsApi.togglePublish(problemId);
      } else {
        const { data } = await problemsApi.create(payload);
        const id = (data as { id: string }).id;
        if (publish) await problemsApi.togglePublish(id);
      }
      toast.success(publish ? 'Problem published!' : 'Draft saved');
      router.push('/admin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-text-muted">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        {problemId ? 'Edit Problem' : 'New Problem'}
      </h1>

      <Card hover={false}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-1 block">Title</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Slug</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => update('difficulty', d)}
                  className={cn(
                    'rounded-lg border px-4 py-2 transition-colors',
                    form.difficulty === d
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/30'
                  )}
                >
                  <DifficultyBadge difficulty={d} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="array, hash-table, dynamic-programming"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-text-muted">Problem Statement</label>
          <button
            onClick={() => setPreviewMd(!previewMd)}
            className="text-xs text-accent hover:underline"
          >
            {previewMd ? 'Edit' : 'Preview Markdown'}
          </button>
        </div>
        {previewMd ? (
          <div className="prose prose-invert max-w-none text-sm text-text-muted whitespace-pre-wrap min-h-[200px] p-3 rounded-lg bg-surface-2">
            {form.statement}
          </div>
        ) : (
          <textarea
            value={form.statement}
            onChange={(e) => update('statement', e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary font-mono text-sm resize-y focus:outline-none focus:border-accent/50"
          />
        )}
      </Card>

      <Card hover={false}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-text-muted mb-1 block">XP Reward</label>
            <input
              type="number"
              value={form.xpReward}
              onChange={(e) => update('xpReward', Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary focus:outline-none focus:border-accent/50"
            />
            <div className="flex gap-2 mt-2">
              {XP_PRESETS.map((xp) => (
                <button
                  key={xp}
                  onClick={() => update('xpReward', xp)}
                  className="text-xs px-2 py-1 rounded border border-border hover:border-accent/50 text-text-muted"
                >
                  {xp}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Time Limit (ms)</label>
            <input
              type="number"
              value={form.timeLimit}
              onChange={(e) => update('timeLimit', Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-1 block">Memory Limit (MB)</label>
            <input
              type="number"
              value={form.memoryLimit}
              onChange={(e) => update('memoryLimit', Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <label className="text-sm text-text-muted mb-2 block">Starter Code</label>
        <div className="flex gap-2 mb-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={cn(
                'px-3 py-1 rounded text-xs border',
                activeLang === lang
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="h-64 rounded-lg overflow-hidden border border-border">
          <CodeEditor
            value={form.starterCode[activeLang] ?? ''}
            language={activeLang}
            theme="vs-dark"
            fontSize={13}
            onChange={(code) =>
              update('starterCode', { ...form.starterCode, [activeLang]: code })
            }
          />
        </div>
      </Card>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-text-muted">Examples</label>
          <Button
            variant="ghost"
            magnetic={false}
            className="text-xs"
            onClick={() =>
              update('examples', [...form.examples, { input: '', output: '', explanation: '' }])
            }
          >
            + Add Example
          </Button>
        </div>
        {form.examples.map((ex, i) => (
          <div key={i} className="grid sm:grid-cols-3 gap-2 mb-3">
            <input
              placeholder="Input"
              value={ex.input}
              onChange={(e) => {
                const examples = [...form.examples];
                examples[i] = { ...ex, input: e.target.value };
                update('examples', examples);
              }}
              className="rounded border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
            />
            <input
              placeholder="Output"
              value={ex.output}
              onChange={(e) => {
                const examples = [...form.examples];
                examples[i] = { ...ex, output: e.target.value };
                update('examples', examples);
              }}
              className="rounded border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
            />
            <input
              placeholder="Explanation"
              value={ex.explanation ?? ''}
              onChange={(e) => {
                const examples = [...form.examples];
                examples[i] = { ...ex, explanation: e.target.value };
                update('examples', examples);
              }}
              className="rounded border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
            />
          </div>
        ))}
      </Card>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-text-muted">Test Cases</label>
          <Button
            variant="ghost"
            magnetic={false}
            className="text-xs"
            onClick={() =>
              update('testCases', [...form.testCases, { input: '', expected: '', isHidden: true }])
            }
          >
            + Add Test Case
          </Button>
        </div>
        {form.testCases.map((tc, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              placeholder="Input"
              value={tc.input}
              onChange={(e) => {
                const testCases = [...form.testCases];
                testCases[i] = { ...tc, input: e.target.value };
                update('testCases', testCases);
              }}
              className="flex-1 rounded border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
            />
            <input
              placeholder="Expected output"
              value={tc.expected}
              onChange={(e) => {
                const testCases = [...form.testCases];
                testCases[i] = { ...tc, expected: e.target.value };
                update('testCases', testCases);
              }}
              className="flex-1 rounded border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
            />
            <label className="flex items-center gap-1 text-xs text-text-muted shrink-0">
              <input
                type="checkbox"
                checked={tc.isHidden}
                onChange={(e) => {
                  const testCases = [...form.testCases];
                  testCases[i] = { ...tc, isHidden: e.target.checked };
                  update('testCases', testCases);
                }}
              />
              Hidden
            </label>
          </div>
        ))}
      </Card>

      <Card hover={false}>
        <label className="text-sm text-text-muted mb-2 block">Hints</label>
        {form.hints.map((hint, i) => (
          <input
            key={i}
            placeholder={`Hint ${i + 1}`}
            value={hint}
            onChange={(e) => {
              const hints = [...form.hints];
              hints[i] = e.target.value;
              update('hints', hints);
            }}
            className="w-full mb-2 rounded border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary"
          />
        ))}
      </Card>

      <div className="flex justify-end gap-3 pb-12">
        <Button variant="secondary" magnetic={false} loading={saving} onClick={() => handleSave(false)}>
          Save Draft
        </Button>
        <Button loading={saving} onClick={() => handleSave(true)}>
          Save & Publish
        </Button>
      </div>
    </div>
  );
}
