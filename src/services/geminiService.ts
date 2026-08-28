import { GoogleGenAI } from '@google/genai';
import { EssayFeedback } from '../types/database';

export function getGeminiApiKey(): string | null {
  // Check Vite env var, localStorage, or process env
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey && storedKey.trim()) return storedKey.trim();

  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }

  return null;
}

export function setGeminiApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem('gemini_api_key', key.trim());
  }
}

/**
 * Strict GRE Analytical Writing Essay Evaluator — Solely Evaluated & Scored by Gemini AI
 */
export async function scoreGreEssay(
  promptTitle: string,
  essayText: string,
  customApiKey?: string
): Promise<EssayFeedback> {
  const apiKey = customApiKey || getGeminiApiKey();
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  if (!essayText || wordCount < 20) {
    return {
      score: 0.0,
      summary: 'Off-topic, blank, or insufficient response.',
      strengths: ['Attempted submission.'],
      weaknesses: [
        'Essay length is far below the minimum requirement (fewer than 20 words).',
        'Lacks a developed argument or thesis statement.',
      ],
      detailed_feedback:
        'A GRE Analytical Writing score of 0.0 indicates an essay that is completely off-topic, written in a foreign language, consists of merely copying the prompt, or is fundamentally insufficient to evaluate.',
      improvement_tips: [
        'Write at least 350 to 500 words to adequately develop a multi-paragraph argument.',
        'Organize your essay with an introduction, 2-3 body paragraphs with evidence, and a conclusion.',
      ],
      evaluated_at: new Date().toISOString(),
    };
  }

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Gemini AI is configured as the sole evaluator. Please set your Gemini API Key in the settings or VITE_GEMINI_API_KEY environment variable.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
You are a senior ETS GRE Analytical Writing Evaluator. You are the SOLE evaluator and scorer for this GRE essay.
Your job is to strictly score a GRE "Analyze an Issue" essay on the official 0.0 to 6.0 scale in 0.5 increments (0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0).

Be VERY STRICT to replicate actual GRE test day conditions.
Evaluate according to official ETS criteria:
1. Articulation & Development of Thesis/Argument
2. Supporting Examples, Logic & Counter-Perspectives
3. Organization & Coherence (Transitions & Paragraph Flow)
4. Syntactic Variety & Vocabulary Choice
5. Standard Written English Conventions (Grammar, Punctuation)

CRITICAL INSTRUCTIONS:
- You MUST respond strictly with valid JSON only (no markdown backticks, no markdown code blocks).
- Format your response EXACTLY as this JSON object structure:
{
  "score": 4.5,
  "summary": "Concise 1-2 sentence overall verdict.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "detailed_feedback": "Detailed paragraph analyzing reasoning, flow, and mechanics.",
  "improvement_tips": ["Actionable step 1 to reach 5.5/6.0", "Actionable step 2"]
}
`;

    const contents = `
GRE ISSUE PROMPT:
${promptTitle}

CANDIDATE ESSAY RESPONSE (Word Count: ${wordCount}):
${essayText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJsonStr);

    let rawScore = Number(parsed.score);
    if (isNaN(rawScore)) rawScore = 3.5;
    // Clamp to 0.0 - 6.0 in 0.5 steps
    const roundedScore = Math.min(6.0, Math.max(0.0, Math.round(rawScore * 2) / 2));

    return {
      score: roundedScore,
      summary: parsed.summary || 'GRE Analytical Writing Evaluation Complete (Gemini AI).',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Developed response submitted.'],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Areas for development identified.'],
      detailed_feedback: parsed.detailed_feedback || 'Detailed feedback evaluated by Gemini AI.',
      improvement_tips: Array.isArray(parsed.improvement_tips) ? parsed.improvement_tips : ['Practice timed essay writing.'],
      evaluated_at: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('Gemini API Essay Scoring Error:', err);
    throw new Error(`Gemini AI Evaluation Failed: ${err.message || err}`);
  }
}
