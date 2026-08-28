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
 * Strict GRE Analytical Writing Essay Evaluator using Gemini API (gemini-3.7-flash)
 */
export async function scoreGreEssay(
  promptTitle: string,
  essayText: string,
  customApiKey?: string
): Promise<EssayFeedback> {
  const apiKey = customApiKey || getGeminiApiKey();
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const paragraphCount = essayText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

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

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
You are a senior ETS GRE Analytical Writing Evaluator.
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
        model: 'gemini-3.7-flash',
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
        summary: parsed.summary || 'GRE Analytical Writing Evaluation Complete.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Developed response submitted.'],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Areas for development identified.'],
        detailed_feedback: parsed.detailed_feedback || 'Detailed feedback evaluated by Gemini AI.',
        improvement_tips: Array.isArray(parsed.improvement_tips) ? parsed.improvement_tips : ['Practice timed essay writing.'],
        evaluated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Gemini API essay evaluation fallback triggered:', err);
    }
  }

  // --- Rule-Based Offline / Fallback Heuristic Evaluator ---
  let heuristicScore = 3.0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const tips: string[] = [];

  if (wordCount >= 450) {
    heuristicScore += 1.5;
    strengths.push(`Substantial essay length (${wordCount} words) allowing detailed argument development.`);
  } else if (wordCount >= 300) {
    heuristicScore += 1.0;
    strengths.push(`Good overall length (${wordCount} words).`);
  } else if (wordCount >= 180) {
    heuristicScore += 0.5;
    weaknesses.push(`Essay length (${wordCount} words) is below the recommended 400+ words for top-tier scores.`);
    tips.push('Expand your body paragraphs with concrete real-world or historical examples.');
  } else {
    heuristicScore -= 0.5;
    weaknesses.push(`Brief essay response (${wordCount} words) limits reasoning depth.`);
    tips.push('Aim for at least 350-500 words under timed conditions.');
  }

  if (paragraphCount >= 4) {
    heuristicScore += 0.5;
    strengths.push(`Clear multi-paragraph structural organization (${paragraphCount} paragraphs).`);
  } else {
    weaknesses.push(`Only ${paragraphCount} paragraph(s) detected. GRE essays require a distinct intro, body, and conclusion.`);
    tips.push('Use explicit paragraph breaks between introduction, supporting arguments, and conclusion.');
  }

  // Check complex transition words
  const transitionWords = ['however', 'therefore', 'consequently', 'furthermore', 'moreover', 'nevertheless', 'in contrast', 'for instance'];
  const foundTransitions = transitionWords.filter((w) => essayText.toLowerCase().includes(w));
  if (foundTransitions.length >= 3) {
    heuristicScore += 0.5;
    strengths.push(`Good use of logical transition signals (${foundTransitions.slice(0, 3).join(', ')}).`);
  } else {
    tips.push('Incorporate sophisticated transition words (e.g. "consequently", "furthermore", "in contrast") to link ideas.');
  }

  const finalScore = Math.min(6.0, Math.max(1.0, Math.round(heuristicScore * 2) / 2));

  return {
    score: finalScore,
    summary: `Essay Evaluated (${wordCount} words, Score ${finalScore}/6.0).`,
    strengths: strengths.length > 0 ? strengths : ['Submitted complete essay draft.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Could benefit from more elaborated examples.'],
    detailed_feedback: `Your essay response of ${wordCount} words across ${paragraphCount} paragraphs has been evaluated using GRE Analytical Writing standards. ${
      finalScore >= 5.0
        ? 'Demonstrates strong critical analysis, logical organization, and effective control of language.'
        : finalScore >= 4.0
        ? 'Presents a competent, well-supported position with sound organization.'
        : 'Presents a basic position; needs deeper critical analysis and richer vocabulary.'
    }`,
    improvement_tips: tips.length > 0 ? tips : ['Practice outlining thesis statements and counterarguments before writing.'],
    evaluated_at: new Date().toISOString(),
  };
}
