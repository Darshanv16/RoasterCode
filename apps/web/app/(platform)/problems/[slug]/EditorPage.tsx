'use client';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { PetAI } from '@/components/pet/PetAI';
import { SimpleMarkdown } from '@/components/problems/SimpleMarkdown';
import {
  TestCasePanel,
  type PublicTestCase,
  type TestResult,
} from '@/components/problems/TestCasePanel';
import { RoastCard } from '@/components/roast/RoastCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { loadDraft, useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { type RoastRequest, useRoastEngine } from '@/hooks/useRoastEngine';
import { useSubmission } from '@/hooks/useSubmission';
import {
  submissionsApi,
  type ProblemDetail,
  type RoastResponse,
} from '@/lib/api';
import { triggerPetHappy, triggerPetSad } from '@/lib/petSystem';
import { cn } from '@/lib/utils';
import { useEditorStore, type Language } from '@/stores/editorStore';
import { useUserStore } from '@/stores/userStore';
import * as Tabs from '@radix-ui/react-tabs';
import { ChevronDown, ChevronRight, Play, Send, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const difficultyVariant = {
  EASY: 'success' as const,
  MEDIUM: 'warning' as const,
  HARD: 'danger' as const,
};

const verdictVariant: Record<string, 'success' | 'danger' | 'warning' | 'pending'> = {
  ACCEPTED: 'success',
  WRONG_ANSWER: 'danger',
  RUNTIME_ERROR: 'danger',
  COMPILATION_ERROR: 'danger',
  TIME_LIMIT_EXCEEDED: 'warning',
  MEMORY_LIMIT_EXCEEDED: 'warning',
  PENDING: 'pending',
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface EditorPageProps {
  problem: ProblemDetail;
}

export function EditorPage({ problem }: EditorPageProps) {
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const {
    code,
    language,
    fontSize,
    setCode,
    setLanguageWithCode,
    setFontSize,
  } = useEditorStore();

  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [leftWidth, setLeftWidth] = useState(45);
  const [bottomHeight, setBottomHeight] = useState(180);
  const [activeBottomTab, setActiveBottomTab] = useState('testcases');
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [runResults, setRunResults] = useState<TestResult[] | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [customCases, setCustomCases] = useState<Array<{ input: string }>>([]);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [submissionDetails, setSubmissionDetails] = useState<
    Record<string, { code: string; roast: RoastResponse | null }>
  >({});
  const [submissions, setSubmissions] = useState<
    Array<{
      id: string;
      verdict: string;
      language: string;
      runtime: number | null;
      memory: number | null;
      createdAt: string;
    }>
  >([]);

  const lastRoastRequest = useRef<RoastRequest | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingH = useRef(false);
  const isDraggingV = useRef(false);

  const { roast, loading: roastLoading, error: roastError, triggerRoast, reset } =
    useRoastEngine();
  const {
    submit,
    pollUntilDone,
    isSubmitting,
    isPolling,
  } = useSubmission(problem.id);
  const { clearDraft } = useAutoSave(problem.slug, code, language);

  const publicTestCases: PublicTestCase[] = useMemo(() => {
    const fromExamples = problem.examples.map((ex, i) => ({
      id: `example-${i}`,
      input: ex.input,
      expected: ex.output,
      order: i,
    }));
    if (fromExamples.length > 0) return fromExamples;
    return problem.testCases.map((tc, i) => ({
      id: tc.id,
      input: tc.input,
      expected: '',
      order: tc.order ?? i,
    }));
  }, [problem]);

  useEffect(() => {
    const defaultLang = 'python';
    const starter =
      problem.starterCode[defaultLang] ??
      problem.starterCode['python'] ??
      '// Write your solution here\n';
    const draft = loadDraft(problem.slug, defaultLang);
    if (draft && draft !== starter) {
      setLanguageWithCode(defaultLang, draft);
      setShowDraftBanner(true);
    } else {
      setLanguageWithCode(defaultLang, starter);
    }
  }, [problem.id, problem.slug, problem.starterCode, setLanguageWithCode]);

  const refetchSubmissions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await submissionsApi.byProblem(problem.id);
      setSubmissions(data.submissions);
    } catch {
      // ignore
    }
  }, [problem.id, user]);

  useEffect(() => {
    refetchSubmissions();
  }, [refetchSubmissions]);

  const handleLanguageChange = (lang: string) => {
    const starter = problem.starterCode[lang];
    const typedLang = lang as Language;
    if (starter) {
      setLanguageWithCode(typedLang, starter);
    } else {
      setLanguageWithCode(typedLang, code);
    }
  };

  const handleReset = () => {
    const starter =
      problem.starterCode[language] ?? problem.starterCode['python'] ?? '';
    setCode(starter);
    clearDraft();
  };

  const handleRun = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to run code');
      return;
    }
    setIsRunning(true);
    setRunResults(null);
    setCompileError(null);
    try {
      const { data } = await submissionsApi.run({
        problemId: problem.id,
        code,
        language,
        customTestCases: customCases,
      });
      setRunResults(data.results);
      setCompileError(data.compileError);
      setActiveBottomTab('output');
      toast.success(`${data.passed}/${data.total} test cases passed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setIsRunning(false);
    }
  }, [user, problem.id, code, language, customCases]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to submit');
      return;
    }
    reset();
    setActiveBottomTab('roast');

    try {
      const submissionId = await submit(code, language);
      const result = await pollUntilDone(submissionId);

      toast[result.verdict === 'ACCEPTED' ? 'success' : 'error'](
        `${result.verdict.replace(/_/g, ' ')} — ${result.passedTests}/${result.totalTests} tests passed`
      );

      if (result.verdict === 'ACCEPTED') {
        triggerPetHappy();
        const wasFirstSolve = (user.problemsSolved ?? 0) === 0;
        if (wasFirstSolve) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6c55f5', '#a855f7', '#10b981', '#ffd700'],
          });
        }
        await fetchUser();
      } else {
        triggerPetSad();
      }

      const roastRequest: RoastRequest = {
        verdict: result.verdict,
        code,
        language,
        problem: {
          title: problem.title,
          difficulty: problem.difficulty,
          statement: problem.statement,
        },
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        errorMessage: result.errorMessage,
      };
      lastRoastRequest.current = roastRequest;
      await triggerRoast(roastRequest);
      refetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    }
  }, [
    user,
    fetchUser,
    reset,
    submit,
    pollUntilDone,
    code,
    language,
    problem,
    triggerRoast,
    refetchSubmissions,
  ]);

  const handleRetryRoast = useCallback(() => {
    if (lastRoastRequest.current) {
      triggerRoast(lastRoastRequest.current);
    }
  }, [triggerRoast]);

  useKeyboardShortcuts({
    onSubmit: handleSubmit,
    onRun: handleRun,
  });

  const handleExpandSubmission = async (id: string) => {
    if (expandedSubmission === id) {
      setExpandedSubmission(null);
      return;
    }
    setExpandedSubmission(id);
    if (!submissionDetails[id]) {
      try {
        const { data } = await submissionsApi.get(id);
        setSubmissionDetails((prev) => ({
          ...prev,
          [id]: { code: data.code, roast: data.roast },
        }));
      } catch {
        toast.error('Failed to load submission');
      }
    }
  };

  const handleSolution = useCallback(
    (solution: string) => {
      setCode(solution);
    },
    [setCode]
  );

  // Horizontal resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingH.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(70, Math.max(25, pct)));
    };
    const onUp = () => {
      isDraggingH.current = false;
      isDraggingV.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const submitting = isSubmitting || isPolling;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {showDraftBanner && (
        <div className="flex items-center justify-between bg-accent/10 border-b border-accent/20 px-4 py-2 text-xs text-accent">
          <span>Draft restored from your last session</span>
          <button onClick={() => setShowDraftBanner(false)} className="hover:text-text-primary">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div ref={containerRef} className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div
          className="flex flex-col min-h-0 border-r border-border"
          style={{ width: `${leftWidth}%` }}
        >
          <Tabs.Root
            value={activeLeftTab}
            onValueChange={setActiveLeftTab}
            className="flex flex-col h-full"
          >
            <Tabs.List className="flex shrink-0 border-b border-border bg-surface-2">
              {['description', 'submissions', 'hints'].map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className={cn(
                    'flex-1 px-4 py-2.5 text-xs font-medium capitalize text-text-muted',
                    'data-[state=active]:text-text-primary data-[state=active]:border-b-2 data-[state=active]:border-accent'
                  )}
                >
                  {tab}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <div className="flex-1 overflow-y-auto p-5">
              <Tabs.Content value="description" className="outline-none">
                <h1 className="text-2xl font-mono font-bold text-text-primary mb-3">
                  {problem.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant={difficultyVariant[problem.difficulty]}>
                    {problem.difficulty}
                  </Badge>
                  {problem.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="default" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="accent" className="ml-auto">
                    <Zap className="h-3 w-3" /> {problem.xpReward} XP
                  </Badge>
                </div>
                <hr className="border-border mb-4" />
                <SimpleMarkdown content={problem.statement} />

                {problem.examples.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Examples</h3>
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
                          <p className="text-[10px] font-semibold text-text-dim mb-2">
                            Example {i + 1}
                          </p>
                          <p className="text-xs text-text-dim mb-1">Input:</p>
                          <pre className="text-xs font-mono text-text-primary bg-surface p-2 rounded mb-2 whitespace-pre-wrap">
                            {ex.input}
                          </pre>
                          <p className="text-xs text-text-dim mb-1">Output:</p>
                          <pre className="text-xs font-mono text-text-primary bg-surface p-2 rounded whitespace-pre-wrap">
                            {ex.output}
                          </pre>
                          {ex.explanation && (
                            <p className="text-xs text-text-muted mt-2">{ex.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Constraints</h3>
                  <pre className="text-xs font-mono text-text-muted whitespace-pre-wrap">
                    {problem.constraints}
                  </pre>
                </div>
              </Tabs.Content>

              <Tabs.Content value="submissions" className="outline-none">
                {!user ? (
                  <p className="text-sm text-text-muted">Log in to see your submissions.</p>
                ) : submissions.length === 0 ? (
                  <p className="text-sm text-text-muted">No submissions yet.</p>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-semibold text-text-dim px-2 pb-2 border-b border-border">
                      <span>Verdict</span>
                      <span>Language</span>
                      <span>Runtime</span>
                      <span>Memory</span>
                      <span>Time</span>
                    </div>
                    {submissions.map((s) => (
                      <div key={s.id}>
                        <button
                          onClick={() => handleExpandSubmission(s.id)}
                          className="w-full grid grid-cols-5 gap-2 items-center px-2 py-2 rounded-lg hover:bg-surface-2 text-xs text-left"
                        >
                          <Badge variant={verdictVariant[s.verdict] ?? 'default'} className="text-[10px]">
                            {s.verdict.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-text-muted">{s.language}</span>
                          <span className="text-text-muted">
                            {s.runtime != null ? `${s.runtime}ms` : '—'}
                          </span>
                          <span className="text-text-muted">
                            {s.memory != null ? `${s.memory}KB` : '—'}
                          </span>
                          <span className="text-text-dim flex items-center gap-1">
                            {formatTimeAgo(s.createdAt)}
                            {expandedSubmission === s.id ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </span>
                        </button>
                        {expandedSubmission === s.id && submissionDetails[s.id] && (
                          <div className="mx-2 mb-2 border border-border rounded-lg overflow-hidden">
                            <div className="h-48">
                              <CodeEditor
                                value={submissionDetails[s.id].code}
                                language={s.language}
                                theme="vs-dark"
                                fontSize={12}
                                onChange={() => {}}
                                readOnly
                              />
                            </div>
                            {submissionDetails[s.id].roast && (
                              <div className="p-3 border-t border-border">
                                <RoastCard
                                  roast={submissionDetails[s.id].roast}
                                  loading={false}
                                  error={null}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="hints" className="outline-none space-y-4">
                {problem.hints.map((hint, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    {revealedHints.has(i) ? (
                      <p className="text-sm text-text-primary animate-fade-in">{hint}</p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm text-text-muted blur-sm select-none">{hint}</p>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="secondary"
                            magnetic={false}
                            className="text-xs"
                            onClick={() =>
                              setRevealedHints((prev) => new Set([...Array.from(prev), i]))
                            }
                          >
                            Reveal Hint {i + 1} — -5 XP to reveal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>

        {/* Resizer */}
        <div
          className="w-1 shrink-0 cursor-col-resize bg-border hover:bg-accent/50 transition-colors"
          onMouseDown={() => {
            isDraggingH.current = true;
          }}
        />

        {/* Right panel */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <EditorToolbar
            language={language}
            onLanguageChange={handleLanguageChange}
            theme={theme}
            onThemeToggle={() => setTheme((t) => (t === 'vs-dark' ? 'light' : 'vs-dark'))}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onReset={handleReset}
          />

          <div className="flex-1 min-h-0 relative">
            <CodeEditor
              value={code}
              language={language}
              theme={theme}
              fontSize={fontSize}
              onChange={setCode}
            />

            {/* Action buttons */}
            <div className="absolute bottom-3 right-3 flex gap-2 z-10">
              <Button
                variant="secondary"
                magnetic={false}
                loading={isRunning}
                className="text-xs py-1.5 px-4 shadow-card"
                onClick={handleRun}
              >
                <Play className="h-3 w-3" /> Run
              </Button>
              <Button
                magnetic={false}
                loading={submitting}
                className="text-xs py-1.5 px-4 shadow-accent"
                onClick={handleSubmit}
              >
                <Send className="h-3 w-3" /> {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Bottom panel resize handle */}
          <div
            className="h-1 shrink-0 cursor-row-resize bg-border hover:bg-accent/50 transition-colors"
            onMouseDown={(e) => {
              isDraggingV.current = true;
              const startY = e.clientY;
              const startH = bottomHeight;
              const onMove = (ev: MouseEvent) => {
                const delta = startY - ev.clientY;
                setBottomHeight(Math.min(400, Math.max(120, startH + delta)));
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          />

          {/* Bottom panel */}
          <div className="shrink-0 flex flex-col border-t border-border" style={{ height: bottomHeight }}>
            <Tabs.Root
              value={activeBottomTab}
              onValueChange={setActiveBottomTab}
              className="flex flex-col h-full"
            >
              <Tabs.List className="flex shrink-0 border-b border-border bg-surface-2">
                <Tabs.Trigger
                  value="testcases"
                  className="px-4 py-2 text-xs text-text-muted data-[state=active]:text-text-primary data-[state=active]:border-b-2 data-[state=active]:border-accent"
                >
                  Test Cases
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="output"
                  className="px-4 py-2 text-xs text-text-muted data-[state=active]:text-text-primary data-[state=active]:border-b-2 data-[state=active]:border-accent"
                >
                  Output
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="roast"
                  className="px-4 py-2 text-xs text-text-muted data-[state=active]:text-text-primary data-[state=active]:border-b-2 data-[state=active]:border-accent"
                >
                  Roast 🔥
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto">
                <Tabs.Content value="testcases" className="h-full outline-none">
                  <TestCasePanel
                    testCases={publicTestCases}
                    runResults={runResults}
                    customCases={customCases}
                    onAddCustomCase={(input) =>
                      setCustomCases((prev) => [...prev, { input }])
                    }
                  />
                </Tabs.Content>

                <Tabs.Content value="output" className="h-full outline-none p-3">
                  {compileError && (
                    <pre className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs font-mono text-danger mb-3 whitespace-pre-wrap">
                      {compileError}
                    </pre>
                  )}
                  {!runResults ? (
                    <p className="text-sm text-text-dim text-center py-8">
                      Run your code to see output
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-text-muted mb-3">
                        {runResults.filter((r) => r.passed).length}/{runResults.length} test cases
                        passed
                      </p>
                      {runResults.map((r, i) => (
                        <OutputRow key={r.testCaseId} result={r} index={i} />
                      ))}
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="roast" className="h-full outline-none p-3">
                  <RoastCard
                    roast={roast}
                    loading={roastLoading}
                    error={roastError}
                    onRetry={handleRetryRoast}
                  />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </div>

      {user && (
        <PetAI
          problemId={problem.id}
          difficulty={problem.difficulty}
          currentCode={code}
          language={language}
          onSolution={handleSolution}
        />
      )}
    </div>
  );
}

function OutputRow({ result, index }: { result: TestResult; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-surface-3"
      >
        <span>{result.passed ? '✅' : '❌'}</span>
        <span className="font-medium text-text-primary">Case {index + 1}</span>
        {result.runtime != null && (
          <span className="text-text-dim">Runtime: {Math.round(result.runtime)}ms</span>
        )}
        <span className="ml-auto text-text-dim truncate max-w-[120px]">
          Expected: {result.expectedOutput?.slice(0, 30)}
        </span>
        <span className="text-text-dim truncate max-w-[120px]">
          Got: {(result.actualOutput ?? result.errorMessage ?? '').slice(0, 30)}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-2 text-xs font-mono border-t border-border pt-2">
          <div>
            <p className="text-text-dim mb-1">Expected</p>
            <pre className="text-text-muted whitespace-pre-wrap">{result.expectedOutput}</pre>
          </div>
          <div>
            <p className="text-text-dim mb-1">Actual</p>
            <pre className="text-text-primary whitespace-pre-wrap">
              {result.actualOutput ?? result.errorMessage}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
