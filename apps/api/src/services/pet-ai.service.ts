import Groq from 'groq-sdk';
import { Problem } from '@prisma/client';

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

export async function generatePetSolution(
  problem: Problem,
  language: string
): Promise<{ solution: string; explanation: string }> {
  const prompt = `You are an expert coding tutor. Generate a complete, working solution for this problem.

Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Language: ${language}

Problem Statement:
${problem.statement}

Constraints:
${problem.constraints}

Respond with ONLY a JSON object (no markdown, no backticks):
{
  "solution": "complete working code in ${language}",
  "explanation": "2-4 sentences explaining the approach in plain English"
}`;

  const completion = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a coding assistant that outputs only valid JSON with solution code and explanation.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('AI failed to generate solution');

  const parsed = JSON.parse(content) as { solution?: string; explanation?: string };
  if (!parsed.solution || !parsed.explanation) {
    throw new Error('Invalid AI response format');
  }

  return { solution: parsed.solution, explanation: parsed.explanation };
}

export async function generatePetHint(
  problem: Problem,
  currentCode: string,
  language: string
): Promise<string> {
  const prompt = `You are a friendly coding pet giving a personalized hint. Analyze the user's CURRENT code and give ONE specific hint based on what they've written so far. Do NOT give the full solution.

Problem: ${problem.title} (${problem.difficulty})
Language: ${language}

Problem Statement (brief):
${problem.statement.slice(0, 500)}

User's current code:
${currentCode || '(empty - they have not started yet)'}

Give a short, encouraging, code-specific hint (2-3 sentences max). Reference their actual code when possible.`;

  const completion = await getGroqClient().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful coding pet. Give personalized hints based on the user code. Never reveal the full solution.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 200,
  });

  const hint = completion.choices[0]?.message?.content?.trim();
  if (!hint) throw new Error('AI failed to generate hint');
  return hint;
}

export const petAiService = { generatePetSolution, generatePetHint };
