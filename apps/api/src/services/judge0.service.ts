import { execSync } from 'child_process';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Verdict } from '@prisma/client';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
};

export interface Judge0Result {
  status_id: number;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export interface TestRunResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string;
  runtime: number | null;
  memory: number | null;
  statusId: number;
  errorMessage: string | null;
}

const JUDGE0_URL = process.env.JUDGE0_URL!;
const JUDGE0_FETCH_TIMEOUT_MS = 10_000;
const MOCK_WARN_MESSAGE = '⚠️  Judge0 unreachable - using mock execution engine';

let mockMode: boolean | null = null;
let mockWarnLogged = false;

function logMockWarning(): void {
  if (!mockWarnLogged) {
    mockWarnLogged = true;
    console.warn(MOCK_WARN_MESSAGE);
  }
}

function isDevMockForced(): boolean {
  return process.env.DEV_MOCK_JUDGE0 === 'true';
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), JUDGE0_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function isJudge0Reachable(): Promise<boolean> {
  if (!JUDGE0_URL) return false;
  try {
    const response = await fetchWithTimeout(JUDGE0_URL, { method: 'GET' });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function shouldUseMockEngine(): Promise<boolean> {
  if (mockMode !== null) return mockMode;

  if (isDevMockForced()) {
    mockMode = true;
    logMockWarning();
    return true;
  }

  const reachable = await isJudge0Reachable();
  if (!reachable) {
    mockMode = true;
    logMockWarning();
    return true;
  }

  mockMode = false;
  return false;
}

function encodeBase64(value: string): string {
  return Buffer.from(value, 'utf-8').toString('base64');
}

function decodeBase64(value: string | null): string | null {
  if (value === null) return null;
  return Buffer.from(value, 'base64').toString('utf-8');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ExecutionOutput {
  stdout: string;
  stderr: string;
  failed: boolean;
  statusId?: number;
}

async function runWithStdin(
  command: string,
  args: string[],
  stdin: string,
  timeoutMs = 5000
): Promise<ExecutionOutput> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (failed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), failed });
    };

    const timer = setTimeout(() => {
      proc.kill();
      finish(true);
    }, timeoutMs);

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on('error', () => finish(true));
    proc.on('close', (code) => finish(code !== 0));

    proc.stdin.write(stdin);
    proc.stdin.end();
  });
}

async function executeInTempFile(
  command: string,
  argsPrefix: string[],
  extension: string,
  sourceCode: string,
  stdin: string
): Promise<ExecutionOutput> {
  const file = join(tmpdir(), `rc-${randomBytes(8).toString('hex')}.${extension}`);
  try {
    await writeFile(file, sourceCode, 'utf8');
    return await runWithStdin(command, [...argsPrefix, file], stdin);
  } catch (err) {
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : 'Execution failed',
      failed: true,
    };
  } finally {
    await unlink(file).catch(() => {});
  }
}

function compilationError(stderr: string): ExecutionOutput {
  return { stdout: '', stderr, failed: true, statusId: 6 };
}

async function executePythonMock(sourceCode: string, stdin: string): Promise<ExecutionOutput> {
  const avail = checkLanguageAvailability();
  const command = avail.python ? 'python' : avail.python3 ? 'python3' : null;
  if (!command) {
    return compilationError('Python not available. Install from https://python.org');
  }
  return executeInTempFile(command, [], 'py', sourceCode, stdin);
}

async function executeJavaScriptMock(sourceCode: string, stdin: string): Promise<ExecutionOutput> {
  if (!checkLanguageAvailability().javascript) {
    return compilationError('JavaScript not available. Install Node.js from https://nodejs.org');
  }
  return executeInTempFile('node', [], 'js', sourceCode, stdin);
}

export interface LanguageAvailability {
  python: boolean;
  python3: boolean;
  javascript: boolean;
  versions: Record<string, string>;
}

let languageAvailabilityCache: LanguageAvailability | null = null;

function tryExec(command: string): string | null {
  try {
    const output = execSync(command, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
      encoding: 'utf8' as const,
    });
    return output.trim().split('\n')[0]?.trim() || null;
  } catch (err) {
    const execErr = err as { stdout?: string; stderr?: string };
    const line = (execErr.stdout || execErr.stderr || '').trim().split('\n')[0]?.trim();
    return line || null;
  }
}

function isCommandInstalled(command: string): boolean {
  try {
    execSync(command, { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export function checkLanguageAvailability(): LanguageAvailability {
  if (languageAvailabilityCache) return languageAvailabilityCache;

  const python = isCommandInstalled('python --version');
  const python3 = !python && isCommandInstalled('python3 --version');
  const javascript = isCommandInstalled('node --version');

  const versions: Record<string, string> = {};
  if (python) versions.python = tryExec('python --version') ?? '';
  if (python3) versions.python3 = tryExec('python3 --version') ?? '';
  if (javascript) versions.javascript = tryExec('node --version') ?? '';

  languageAvailabilityCache = {
    python,
    python3,
    javascript,
    versions,
  };

  return languageAvailabilityCache;
}

function logLanguageAvailability(): void {
  const avail = checkLanguageAvailability();
  const status = (ok: boolean) => (ok ? '✅ available' : '❌ not found');

  console.log('=== Language Availability ===');
  console.log(`Python:     ${status(avail.python || avail.python3)}`);
  console.log(`JavaScript: ${status(avail.javascript)}`);
}

logLanguageAvailability();

export interface LanguageInfo {
  id: string;
  name: string;
  available: boolean;
  version?: string;
  installUrl?: string;
  status: 'available' | 'limited' | 'unavailable';
}

const LANGUAGE_DEFINITIONS = [
  { id: 'python', name: 'Python 3', installUrl: 'https://python.org' },
  { id: 'javascript', name: 'JavaScript', installUrl: 'https://nodejs.org' },
] as const;

export async function getLanguageAvailability(): Promise<LanguageInfo[]> {
  const useMock = await shouldUseMockEngine();
  const avail = checkLanguageAvailability();
  const results: LanguageInfo[] = [];

  for (const lang of LANGUAGE_DEFINITIONS) {
    let available = false;
    let version: string | undefined;

    if (lang.id === 'python') {
      available = avail.python || avail.python3;
      version = avail.versions.python || avail.versions.python3;
    } else if (lang.id === 'javascript') {
      available = avail.javascript;
      version = avail.versions.javascript;
    }

    let status: LanguageInfo['status'] = 'unavailable';
    if (available) {
      status = 'available';
    } else if (useMock && (lang.id === 'python' || lang.id === 'javascript')) {
      status = 'limited';
    }

    results.push({
      id: lang.id,
      name: lang.name,
      available,
      version: version || undefined,
      installUrl: available ? undefined : lang.installUrl,
      status,
    });
  }

  return results;
}

async function executeMockCode(
  sourceCode: string,
  language: string,
  stdin: string
): Promise<ExecutionOutput> {
  switch (language) {
    case 'javascript':
      return executeJavaScriptMock(sourceCode, stdin);
    case 'python':
    default:
      return executePythonMock(sourceCode, stdin);
  }
}

function buildMockResult(
  execution: ExecutionOutput,
  expectedOutput: string
): Judge0Result {
  const base = {
    time: '0.05',
    memory: 1024,
    compile_output: null,
  };

  if (execution.statusId === 6) {
    return {
      ...base,
      status_id: 6,
      status: { id: 6, description: 'Compilation Error' },
      stdout: null,
      stderr: execution.stderr,
    };
  }

  if ((execution.failed && execution.stderr) || execution.stderr?.trim()) {
    return {
      ...base,
      status_id: 11,
      status: { id: 11, description: 'Runtime Error (NZEC)' },
      stdout: execution.stdout || null,
      stderr: execution.stderr,
    };
  }

  const normalize = (value: string) => value.trim().replace(/\r\n/g, '\n');
  const actual = normalize(execution.stdout);
  const expected = normalize(expectedOutput);
  const passed = actual === expected;

  return {
    ...base,
    status_id: passed ? 3 : 4,
    status: { id: passed ? 3 : 4, description: passed ? 'Accepted' : 'Wrong Answer' },
    stdout: execution.stdout || null,
    stderr: passed ? null : execution.stderr || null,
  };
}

async function runMockTestCase(
  sourceCode: string,
  language: string,
  stdin: string,
  expectedOutput: string
): Promise<Judge0Result> {
  console.log('TEST CASE INPUT:', JSON.stringify(stdin));
  console.log('TEST CASE EXPECTED:', JSON.stringify(expectedOutput));

  const execution = await executeMockCode(sourceCode, language, stdin);
  const result = buildMockResult(execution, expectedOutput);

  console.log('ACTUAL OUTPUT:', result.stdout);

  return result;
}

function encodeBase64Fields(raw: {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
}): Pick<Judge0Result, 'stdout' | 'stderr' | 'compile_output'> {
  return {
    stdout: decodeBase64(raw.stdout),
    stderr: decodeBase64(raw.stderr),
    compile_output: decodeBase64(raw.compile_output),
  };
}

export async function createJudge0Submission(params: {
  sourceCode: string;
  languageId: number;
  stdin: string;
  expectedOutput: string;
  cpuTimeLimit: number;
  memoryLimit: number;
}): Promise<string> {
  const response = await fetchWithTimeout(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: params.languageId,
        source_code: encodeBase64(params.sourceCode),
        stdin: encodeBase64(params.stdin),
        expected_output: encodeBase64(params.expectedOutput),
        cpu_time_limit: params.cpuTimeLimit,
        memory_limit: params.memoryLimit,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Judge0 submission failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function pollJudge0Result(
  token: string,
  maxAttempts = 15
): Promise<Judge0Result> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetchWithTimeout(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=status_id,status,stdout,stderr,compile_output,time,memory`
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Judge0 poll failed: ${response.status} ${text}`);
    }

    const raw = (await response.json()) as {
      status_id: number;
      status: { id: number; description: string };
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      time: string | null;
      memory: number | null;
    };

    if (raw.status_id < 3) {
      await sleep(1500);
      continue;
    }

    return {
      status_id: raw.status_id,
      status: raw.status,
      ...encodeBase64Fields(raw),
      time: raw.time,
      memory: raw.memory,
    };
  }

  throw new Error(`Judge0 timeout after ${maxAttempts} attempts`);
}

function extractErrorMessage(result: Judge0Result): string | null {
  return result.stderr || result.compile_output || null;
}

function toTestRunResult(
  testCase: { id: string; expected: string },
  judgeResult: Judge0Result
): TestRunResult {
  const actualOutput = judgeResult.stdout;
  const normalize = (value: string) => value.trim().replace(/\r\n/g, '\n');
  const passed =
    judgeResult.status_id === 3 &&
    normalize(actualOutput ?? '') === normalize(testCase.expected);

  return {
    testCaseId: testCase.id,
    passed,
    actualOutput,
    expectedOutput: testCase.expected,
    runtime: judgeResult.time ? parseFloat(judgeResult.time) * 1000 : null,
    memory: judgeResult.memory,
    statusId: judgeResult.status_id,
    errorMessage: extractErrorMessage(judgeResult),
  };
}

export async function runAllTestCases(params: {
  sourceCode: string;
  language: string;
  testCases: Array<{ id: string; input: string; expected: string }>;
  timeLimit: number;
  memoryLimit: number;
}): Promise<TestRunResult[]> {
  const languageId = LANGUAGE_IDS[params.language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${params.language}`);
  }

  const useMock = await shouldUseMockEngine();
  const results: TestRunResult[] = [];

  if (useMock) {
    for (const testCase of params.testCases) {
      const judgeResult = await runMockTestCase(
        params.sourceCode,
        params.language,
        testCase.input,
        testCase.expected
      );
      results.push(toTestRunResult(testCase, judgeResult));
    }
    return results;
  }

  const cpuTimeLimit = params.timeLimit / 1000;
  const memoryLimitKb = params.memoryLimit * 1024;

  for (const testCase of params.testCases) {
    const token = await createJudge0Submission({
      sourceCode: params.sourceCode,
      languageId,
      stdin: testCase.input,
      expectedOutput: testCase.expected,
      cpuTimeLimit,
      memoryLimit: memoryLimitKb,
    });

    const judgeResult = await pollJudge0Result(token);
    results.push(toTestRunResult(testCase, judgeResult));
  }

  return results;
}

export function determineVerdict(results: TestRunResult[]): Verdict {
  if (results.some((r) => r.statusId === 5)) return 'TIME_LIMIT_EXCEEDED';
  if (results.some((r) => r.statusId === 6)) return 'COMPILATION_ERROR';
  if (results.some((r) => r.statusId >= 7 && r.statusId <= 13)) return 'RUNTIME_ERROR';
  if (results.every((r) => r.passed)) return 'ACCEPTED';
  return 'WRONG_ANSWER';
}
