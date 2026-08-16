import { Question, Option, Answer } from '../types/database';

export interface EvaluationResult {
  isCorrect: boolean;
  scoreAwarded: number;
  maxPoints: number;
}

/**
 * Server/Platform Authoritative Scoring Engine
 * Evaluates candidate response against question rules & correct options.
 */
export function evaluateQuestionAnswer(
  question: Question,
  answer: Answer | undefined
): EvaluationResult {
  const points = question.points || 1.0;

  if (!answer) {
    return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
  }

  const { selected_option_ids = [], text_answer = '' } = answer;

  switch (question.question_type) {
    case 'MULTIPLE_CHOICE':
    case 'QUANTITATIVE_COMPARISON':
    case 'READING_COMPREHENSION': {
      const correctOptionIds = (question.options || [])
        .filter((opt) => opt.is_correct)
        .map((opt) => opt.id);

      if (correctOptionIds.length === 0) {
        return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
      }

      // Check exact match (all correct options selected, no incorrect options selected)
      const hasAllCorrect = correctOptionIds.every((id) => selected_option_ids.includes(id));
      const hasNoExtra = selected_option_ids.every((id) => correctOptionIds.includes(id));

      const isCorrect = hasAllCorrect && hasNoExtra && selected_option_ids.length > 0;
      return {
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxPoints: points,
      };
    }

    case 'SENTENCE_EQUIVALENCE': {
      // Must select both correct options (usually exactly 2 correct out of 6)
      const correctOptionIds = (question.options || [])
        .filter((opt) => opt.is_correct)
        .map((opt) => opt.id);

      const hasAllCorrect = correctOptionIds.every((id) => selected_option_ids.includes(id));
      const hasNoExtra = selected_option_ids.every((id) => correctOptionIds.includes(id));

      const isCorrect =
        hasAllCorrect &&
        hasNoExtra &&
        selected_option_ids.length === correctOptionIds.length &&
        correctOptionIds.length > 0;

      return {
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxPoints: points,
      };
    }

    case 'NUMERIC_ENTRY': {
      if (!text_answer || text_answer.trim() === '') {
        return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
      }

      const numVal = parseFloat(text_answer.trim());
      if (isNaN(numVal)) {
        return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
      }

      // Compile list of accepted numeric answers
      const acceptedList: number[] = [];
      if (question.accepted_numeric_answers && question.accepted_numeric_answers.length > 0) {
        acceptedList.push(...question.accepted_numeric_answers);
      } else if (question.numeric_answer !== undefined && question.numeric_answer !== null) {
        acceptedList.push(question.numeric_answer);
      }

      if (acceptedList.length === 0) {
        return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
      }

      const tolerance = question.numeric_tolerance || 0;

      // Check if candidate response matches ANY accepted right answer within tolerance
      const isCorrect = acceptedList.some((target) => Math.abs(numVal - target) <= tolerance);

      return {
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxPoints: points,
      };
    }

    case 'TEXT_COMPLETION': {
      // Match text answer case-insensitively or via correct options if option-based
      if (question.options && question.options.length > 0) {
        const correctOptionIds = question.options.filter((o) => o.is_correct).map((o) => o.id);
        const isCorrect = selected_option_ids.some((id) => correctOptionIds.includes(id));
        return { isCorrect, scoreAwarded: isCorrect ? points : 0, maxPoints: points };
      }

      const isCorrect =
        text_answer.trim().toLowerCase() === String(question.numeric_answer || '').trim().toLowerCase();
      return { isCorrect, scoreAwarded: isCorrect ? points : 0, maxPoints: points };
    }

    default:
      return { isCorrect: false, scoreAwarded: 0, maxPoints: points };
  }
}

/**
 * Calculates score breakdown for a complete candidate attempt.
 */
export function calculateAttemptScore(
  questions: Question[],
  answersMap: Record<string, Answer>
): { score: number; maxScore: number; percentage: number } {
  let score = 0;
  let maxScore = 0;

  for (const q of questions) {
    const qPoints = q.points || 1.0;
    maxScore += qPoints;

    const ans = answersMap[q.id];
    const res = evaluateQuestionAnswer(q, ans);
    score += res.scoreAwarded;
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percentage };
}
