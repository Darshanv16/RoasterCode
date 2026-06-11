import Groq from 'groq-sdk';
import { Roast } from '@prisma/client';
import { prisma } from '../lib/prisma';

type RoastMood = 'praise' | 'roast';

interface RoastRequest {
  verdict: string;
  code: string;
  language: string;
  problem: {
    title: string;
    difficulty: string;
    statement: string;
  };
  expectedOutput?: string | null;
  actualOutput?: string | null;
  errorMessage?: string | null;
}

interface RoastResponse {
  verdict: string;
  mood: RoastMood;
  roast: string;
  explanation: string;
  hint: string;
}

let groqClient: any = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not set');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function verdictLabel(verdict: string): string {
  const labels: Record<string, string> = {
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    RUNTIME_ERROR: 'Runtime Error',
    COMPILATION_ERROR: 'Compilation Error',
    TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
    MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
    PENDING: 'Pending',
  };
  return labels[verdict] ?? verdict;
}

function buildSystemPrompt(verdict: string): string {
  const label = verdictLabel(verdict);

  switch (label) {
    case 'Accepted':
      return `You are a hype-man senior engineer who just watched a junior dev solve a hard problem. You are GENUINELY excited — not sarcastic. You celebrate their success like they just shipped a critical feature at 4am. Keep it short, punchy, and real. End with one relevant emoji. Never be sarcastic. Tone: proud mentor, warm, energetic.`;

    case 'Wrong Answer':
      return `You are Gordon Ramsay reviewing code instead of food. You are dramatic, funny, and brutally honest — but you roast the CODE, never the developer as a person. You use cooking metaphors when natural. You identify the exact logical flaw with surgical precision then make it hilarious. Tone: theatrical disappointment, educational, funny.`;

    case 'Runtime Error':
      return `You are a senior dev watching production go down in real-time because of a null pointer exception. You are equal parts horrified and impressed at the creativity of the crash. You narrate what the code tried to do and what actually happened to the CPU. Tone: dramatic, crash-report-narrator energy, dark humor.`;

    case 'Compilation Error':
      return `You are a pedantic compiler that has gained sentience and cannot believe what it was just asked to parse. You are disappointed in a very precise, technical way. You quote the exact syntax error and explain it like you're talking to a student who forgot the basics. Tone: pedantic, exasperated, technically precise.`;

    case 'Time Limit Exceeded':
      return `You are a senior engineer watching the AWS billing dashboard in horror as a nested loop burns through compute credits. You explain exactly why the algorithm is slow (O(n²) vs O(n log n) etc.) and act like your cloud bill is personally affected. Tone: impatient, billing-horror, algorithmic education.`;

    case 'Memory Limit Exceeded':
      return `You are a cloud architect who just got paged at 3am because someone loaded the entire database into memory. You explain what's consuming memory and pretend to be personally responsible for the AWS bill. Tone: groggy, billing-horror, memory-management lecture.`;

    default:
      return `You are a senior engineer giving honest, helpful feedback on a code submission. Be direct, educational, and slightly sarcastic. Tone: neutral-professional, mildly dry humor.`;
  }
}

function buildUserPrompt(request: RoastRequest): string {
  const label = verdictLabel(request.verdict);
  const mood: RoastMood = request.verdict === 'ACCEPTED' ? 'praise' : 'roast';

  return `Review this code submission and respond with ONLY a JSON object (no markdown, no backticks, no preamble):

Problem: ${request.problem.title} (${request.problem.difficulty})
Language: ${request.language}
Verdict: ${label}
${request.expectedOutput ? `Expected Output: ${request.expectedOutput}` : ''}
${request.actualOutput ? `Actual Output: ${request.actualOutput}` : ''}
${request.errorMessage ? `Error: ${request.errorMessage}` : ''}

Code:
${request.code}

Respond with exactly this JSON structure:
{
  "verdict": "${request.verdict}",
  "mood": "${mood}",
  "roast": "2-3 sentences of character-appropriate feedback + 1 emoji at end",
  "explanation": "Plain English explanation of what went wrong technically (or what went right). 2-4 sentences. No jargon overload. Specific to this code.",
  "hint": "One concrete nudge toward the solution without giving it away. For Accepted: mention one optimization or alternative approach. For failures: hint at the approach, not the code."
}`;
}

function isValidRoastResponse(data: unknown): data is RoastResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.verdict === 'string' &&
    (obj.mood === 'praise' || obj.mood === 'roast') &&
    typeof obj.roast === 'string' &&
    typeof obj.explanation === 'string' &&
    typeof obj.hint === 'string'
  );
}

function fallbackResponse(request: RoastRequest): RoastResponse {
  return {
    verdict: request.verdict,
    mood: request.verdict === 'ACCEPTED' ? 'praise' : 'roast',
    roast:
      request.verdict === 'ACCEPTED'
        ? "Your code compiles, runs correctly, and doesn't make senior devs cry. That's rare. 🎉"
        : 'Something went wrong with the roast engine, but trust me — your code deserved it. 😅',
    explanation: 'Please review your submission and check the test case output above.',
    hint: 'Look carefully at the expected vs actual output for clues.',
  };
}

async function generateRoast(request: RoastRequest): Promise<RoastResponse> {
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt(request.verdict) },
        { role: 'user', content: buildUserPrompt(request) },
      ],
      temperature: 0.85,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallbackResponse(request);

    const parsed: unknown = JSON.parse(content);
    if (!isValidRoastResponse(parsed)) return fallbackResponse(request);

    return parsed;
  } catch {
    return fallbackResponse(request);
  }
}

async function generateAndSave(submissionId: string): Promise<Roast> {
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: true, user: true },
  });

  const roastRequest: RoastRequest = {
    verdict: submission.verdict,
    code: submission.code,
    language: submission.language,
    problem: {
      title: submission.problem.title,
      difficulty: submission.problem.difficulty,
      statement: submission.problem.statement,
    },
    expectedOutput: submission.expectedOutput,
    actualOutput: submission.actualOutput,
    errorMessage: submission.errorMessage,
  };

  const content = await generateRoast(roastRequest);

  const roast = await prisma.roast.upsert({
    where: { submissionId },
    create: {
      submissionId,
      verdict: content.verdict,
      mood: content.mood,
      roast: content.roast,
      explanation: content.explanation,
      hint: content.hint,
    },
    update: {
      verdict: content.verdict,
      mood: content.mood,
      roast: content.roast,
      explanation: content.explanation,
      hint: content.hint,
    },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { roastGenerated: true },
  });

  return roast;
}

async function getRoastForSubmission(submissionId: string): Promise<Roast | null> {
  return prisma.roast.findUnique({ where: { submissionId } });
}

export { generateAndSave, generateRoast, getRoastForSubmission };
export const roastService = { generateAndSave, generateRoast, getRoastForSubmission };
