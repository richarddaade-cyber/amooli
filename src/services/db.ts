import {
  Test,
  Section,
  Question,
  Option,
  Passage,
  Attempt,
  Answer,
  EventLog,
  TestStatus,
  TestFullDetails,
} from '../types/database';
import { generateAccessCode } from './timer';
import { calculateAttemptScore } from './scoring';
import { supabaseDb } from './supabaseDb';

const LOCAL_STORAGE_KEY_TESTS = 'preppulse_tests';
const LOCAL_STORAGE_KEY_ATTEMPTS = 'preppulse_attempts';

// --- Sample Initial Seed Data ---
const SEED_TESTS: TestFullDetails[] = [
  {
    test: {
      id: 'test-gre-quant-1',
      title: 'GRE Quantitative Reasoning — Practice Test 1',
      description: 'Comprehensive practice covering Quantitative Comparison, Numeric Entry, and Multiple Choice algebra/geometry questions.',
      instructions: 'Answer all questions to the best of your ability. Your progress is autosaved. You may mark questions for review and return to them anytime before submission.',
      duration_minutes: 35,
      status: 'ACTIVE',
      access_code: 'Q7K4P9',
      max_attempts: 3,
      result_visibility: 'AFTER_SUBMISSION',
      randomize_questions: false,
      randomize_options: false,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      sections_count: 1,
      questions_count: 5,
    },
    sections: [
      {
        id: 'sec-quant-1',
        test_id: 'test-gre-quant-1',
        title: 'Section 1: Quantitative Reasoning',
        description: 'Quantitative comparison and problem-solving practice.',
        position: 1,
        created_at: new Date().toISOString(),
        passages: [],
        questions: [
          {
            id: 'q-quant-1',
            section_id: 'sec-quant-1',
            question_type: 'QUANTITATIVE_COMPARISON',
            prompt: 'Given that x > 0 and y > 0, with x² + y² = 25 and xy = 12:',
            quantity_a: '(x + y)²',
            quantity_b: '49',
            explanation: 'Expanding (x + y)² gives x² + 2xy + y². Substituting x² + y² = 25 and xy = 12: (x + y)² = 25 + 2(12) = 25 + 24 = 49. Therefore, Quantity A equals Quantity B.',
            points: 1,
            position: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: [
              { id: 'opt-qc-1', question_id: 'q-quant-1', option_text: 'Quantity A is greater.', is_correct: false, position: 1 },
              { id: 'opt-qc-2', question_id: 'q-quant-1', option_text: 'Quantity B is greater.', is_correct: false, position: 2 },
              { id: 'opt-qc-3', question_id: 'q-quant-1', option_text: 'The two quantities are equal.', is_correct: true, position: 3 },
              { id: 'opt-qc-4', question_id: 'q-quant-1', option_text: 'The relationship cannot be determined from the information given.', is_correct: false, position: 4 },
            ],
          },
          {
            id: 'q-quant-2',
            section_id: 'sec-quant-1',
            question_type: 'MULTIPLE_CHOICE',
            prompt: 'A right-angled triangle has legs of length 6 cm and 8 cm. What is the area of a square whose side length is equal to the hypotenuse of this triangle?',
            explanation: 'Hypotenuse h = √(6² + 8²) = √(36 + 64) = √100 = 10 cm. Area of square with side 10 cm = 10² = 100 cm².',
            points: 1,
            position: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: [
              { id: 'opt-mc-1', question_id: 'q-quant-2', option_text: '48 cm²', is_correct: false, position: 1 },
              { id: 'opt-mc-2', question_id: 'q-quant-2', option_text: '64 cm²', is_correct: false, position: 2 },
              { id: 'opt-mc-3', question_id: 'q-quant-2', option_text: '100 cm²', is_correct: true, position: 3 },
              { id: 'opt-mc-4', question_id: 'q-quant-2', option_text: '144 cm²', is_correct: false, position: 4 },
            ],
          },
          {
            id: 'q-quant-3',
            section_id: 'sec-quant-1',
            question_type: 'NUMERIC_ENTRY',
            prompt: 'If 3x + 7 = 28, enter the value of x² + 1.',
            numeric_answer: 50,
            numeric_tolerance: 0,
            explanation: '3x + 7 = 28 ⇒ 3x = 21 ⇒ x = 7. Thus, x² + 1 = 7² + 1 = 49 + 1 = 50.',
            points: 1,
            position: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: [],
          },
          {
            id: 'q-quant-4',
            section_id: 'sec-quant-1',
            question_type: 'SENTENCE_EQUIVALENCE',
            prompt: 'Select the TWO answer choices that best complete the sentence:',
            explanation: 'Both "lucid" and "perspicuous" mean clear and easy to understand.',
            points: 1,
            position: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: [
              { id: 'opt-se-1', question_id: 'q-quant-4', option_text: 'Lucid', is_correct: true, position: 1 },
              { id: 'opt-se-2', question_id: 'q-quant-4', option_text: 'Obscure', is_correct: false, position: 2 },
              { id: 'opt-se-3', question_id: 'q-quant-4', option_text: 'Perspicuous', is_correct: true, position: 3 },
              { id: 'opt-se-4', question_id: 'q-quant-4', option_text: 'Ambiguous', is_correct: false, position: 4 },
              { id: 'opt-se-5', question_id: 'q-quant-4', option_text: 'Tenebrous', is_correct: false, position: 5 },
              { id: 'opt-se-6', question_id: 'q-quant-4', option_text: 'Convoluted', is_correct: false, position: 6 },
            ],
          },
          {
            id: 'q-quant-5',
            section_id: 'sec-quant-1',
            passage_id: 'pass-rc-1',
            question_type: 'READING_COMPREHENSION',
            prompt: 'According to the passage, what primary factor led to the acceleration of oceanic deep-water currents during the Eocene epoch?',
            explanation: 'Paragraph 2 highlights thermal gradients driven by polar cooling as the dominant mechanism.',
            points: 1,
            position: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passage: {
              id: 'pass-rc-1',
              section_id: 'sec-quant-1',
              title: 'Paleoclimatology & Deep Ocean Circulation',
              content: `During the early Eocene epoch, roughly 50 million years ago, Earth experienced a hyperthermal period characterized by significantly elevated surface temperatures. Recent sediment core analyses from the equatorial Pacific reveal that oceanic thermohaline circulation underwent profound reorganization during this interval.

Contrary to early hypotheses suggesting ocean stagnation, deep-water current velocities accelerated due to sharp thermal gradients established between equatorial surface waters and intensifying sub-polar cooling zones. This high-energy ocean circulation efficiently transported dissolved inorganic carbon into benthic sinks, moderating atmospheric greenhouse gas concentrations over multi-millennial timescales.`,
              position: 1,
              created_at: new Date().toISOString(),
            },
            options: [
              { id: 'opt-rc-1', question_id: 'q-quant-5', option_text: 'Increased equatorial salinity caused by evaporation', is_correct: false, position: 1 },
              { id: 'opt-rc-2', question_id: 'q-quant-5', option_text: 'Thermal gradients between equatorial waters and sub-polar cooling zones', is_correct: true, position: 2 },
              { id: 'opt-rc-3', question_id: 'q-quant-5', option_text: 'Global ocean stagnation during hyperthermal periods', is_correct: false, position: 3 },
              { id: 'opt-rc-4', question_id: 'q-quant-5', option_text: 'Atmospheric pressure drops over equatorial regions', is_correct: false, position: 4 },
            ],
          },
        ],
      },
    ],
  },
];

// --- Local Storage Management Helpers ---
function sanitizeBundle(b: any): TestFullDetails {
  if (!b || typeof b !== 'object') return SEED_TESTS[0];
  const test = b.test || {};
  const sections = Array.isArray(b.sections) ? b.sections : [];

  const cleanSections = sections.map((sec: any, sIdx: number) => ({
    id: sec?.id || `sec-${Date.now()}-${sIdx}`,
    test_id: sec?.test_id || test.id || '',
    title: sec?.title || `Section ${sIdx + 1}`,
    description: sec?.description || '',
    position: sec?.position || sIdx + 1,
    created_at: sec?.created_at || new Date().toISOString(),
    passages: Array.isArray(sec?.passages) ? sec.passages : [],
    questions: (Array.isArray(sec?.questions) ? sec.questions : []).map((q: any, qIdx: number) => ({
      ...q,
      id: q?.id || `q-${Date.now()}-${qIdx}`,
      section_id: q?.section_id || sec?.id || '',
      question_type: q?.question_type || 'MULTIPLE_CHOICE',
      prompt: q?.prompt || '',
      options: Array.isArray(q?.options) ? q.options : [],
      points: q?.points || 1.0,
      position: q?.position || qIdx + 1,
    })),
  }));

  if (cleanSections.length === 0) {
    cleanSections.push({
      id: `sec-${Date.now()}-1`,
      test_id: test.id || '',
      title: 'Section 1: General Assessment',
      description: 'Primary assessment section',
      position: 1,
      created_at: new Date().toISOString(),
      passages: [],
      questions: [],
    });
  }

  return {
    test: {
      id: test.id || `test-${Date.now()}`,
      title: test.title || 'Untitled Test',
      description: test.description || '',
      instructions: test.instructions || '',
      access_code: test.access_code || generateAccessCode(),
      is_code_active: test.is_code_active !== false,
      duration_minutes: test.duration_minutes || 30,
      status: test.status || 'DRAFT',
      max_attempts: test.max_attempts || 1,
      result_visibility: test.result_visibility || 'AFTER_SUBMISSION',
      randomize_questions: !!test.randomize_questions,
      randomize_options: !!test.randomize_options,
      created_at: test.created_at || new Date().toISOString(),
      updated_at: test.updated_at || new Date().toISOString(),
    },
    sections: cleanSections,
  };
}

function getStoredTestBundles(): TestFullDetails[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TESTS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_TESTS, JSON.stringify(SEED_TESTS));
      return SEED_TESTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_TESTS;
    return parsed.map(sanitizeBundle);
  } catch (err) {
    console.error('Error reading local tests:', err);
    return SEED_TESTS;
  }
}

function saveStoredTestBundles(bundles: TestFullDetails[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TESTS, JSON.stringify(bundles));
  } catch (err) {
    console.error('Error saving local tests:', err);
  }
}

function getStoredAttempts(): Record<string, Attempt> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading local attempts:', err);
    return {};
  }
}

function saveStoredAttempts(attempts: Record<string, Attempt>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
  } catch (err) {
    console.error('Error saving local attempts:', err);
  }
}

// --- Database Service API ---

export const dbService = {
  /**
   * Get all tests for Admin Dashboard from Database & Local Store
   */
  async getTests(): Promise<Test[]> {
    try {
      const dbTests = await supabaseDb.getTests();
      if (dbTests && dbTests.length > 0) {
        return dbTests;
      }
    } catch (e) {
      console.warn('Fallback to local storage:', e);
    }

    const bundles = getStoredTestBundles();
    const attempts = Object.values(getStoredAttempts());

    return bundles.map((b) => {
      let qCount = 0;
      b.sections.forEach((s) => (qCount += s.questions.length));
      const activeCount = attempts.filter(
        (a) => a.test_id === b.test.id && a.status === 'IN_PROGRESS'
      ).length;

      return {
        ...b.test,
        sections_count: b.sections.length,
        questions_count: qCount,
        active_candidates_count: activeCount,
      };
    });
  },

  /**
   * Get full details of a test (test + sections + questions + options)
   */
  async getTestFullDetails(testId: string): Promise<TestFullDetails | null> {
    try {
      const dbBundle = await supabaseDb.getTestFullDetails(testId);
      if (dbBundle) return dbBundle;
    } catch (e) {
      console.warn('Fallback to local test details:', e);
    }

    const bundles = getStoredTestBundles();
    return bundles.find((b) => b.test.id === testId) || null;
  },

  /**
   * Get test bundle by Access Code from Cloud Database (Multi-Device) & Local Store Fallback
   */
  async getTestByAccessCode(code: string): Promise<{ bundle: TestFullDetails | null; error?: string }> {
    const cleanCode = code.trim().toUpperCase();

    // 1. Query Supabase Cloud Database first (Multi-Device Support for Phone, Laptop, Tablet)
    try {
      const dbBundle = await supabaseDb.getTestByAccessCode(cleanCode);
      if (dbBundle) {
        const t = dbBundle.test;
        if (t.is_code_active === false) {
          return { bundle: null, error: 'This test access code has been invalidated by the administrator.' };
        }
        if (t.status === 'CLOSED') {
          return { bundle: null, error: 'This test has been closed by the administrator.' };
        }
        if (t.code_expires_at) {
          const expiresMs = new Date(t.code_expires_at).getTime();
          if (Date.now() > expiresMs) {
            return { bundle: null, error: `This access code expired on ${new Date(t.code_expires_at).toLocaleString()}.` };
          }
        }
        if (t.code_max_uses !== undefined && t.code_max_uses !== null && t.code_max_uses > 0) {
          const currentUses = t.code_current_uses || 0;
          if (currentUses >= t.code_max_uses) {
            return { bundle: null, error: `This access code has reached its maximum usage limit (${t.code_max_uses} candidate joins).` };
          }
        }
        return { bundle: sanitizeBundle(dbBundle) };
      }
    } catch (e) {
      console.warn('Supabase getTestByAccessCode notice:', e);
    }

    // 2. Fallback to Local Storage
    const bundles = getStoredTestBundles();
    const found = bundles.find((b) => b.test.access_code?.toUpperCase() === cleanCode);

    if (!found) {
      return { bundle: null, error: 'Invalid access code. Please check the code and try again.' };
    }

    const t = found.test;

    if (t.is_code_active === false) {
      return { bundle: null, error: 'This test access code has been invalidated by the administrator.' };
    }

    if (t.status === 'CLOSED') {
      return { bundle: null, error: 'This test has been closed by the administrator.' };
    }

    if (t.code_expires_at) {
      const expiresMs = new Date(t.code_expires_at).getTime();
      if (Date.now() > expiresMs) {
        return { bundle: null, error: `This access code expired on ${new Date(t.code_expires_at).toLocaleString()}.` };
      }
    }

    if (t.code_max_uses !== undefined && t.code_max_uses !== null && t.code_max_uses > 0) {
      const currentUses = t.code_current_uses || 0;
      if (currentUses >= t.code_max_uses) {
        return { bundle: null, error: `This access code has reached its maximum usage limit (${t.code_max_uses} candidate joins).` };
      }
    }

    return { bundle: sanitizeBundle(found) };
  },

  /**
   * Create or Update a Test — Saves directly to Database & Local Store
   */
  async saveTestBundle(bundle: TestFullDetails): Promise<TestFullDetails> {
    const bundles = getStoredTestBundles();
    const idx = bundles.findIndex((b) => b.test.id === bundle.test.id);

    // Auto-generate code if missing
    if (!bundle.test.access_code) {
      bundle.test.access_code = generateAccessCode();
    }
    if (bundle.test.is_code_active === undefined) {
      bundle.test.is_code_active = true;
    }

    bundle.test.updated_at = new Date().toISOString();

    if (idx >= 0) {
      bundles[idx] = bundle;
    } else {
      bundles.push(bundle);
    }

    saveStoredTestBundles(bundles);

    // Save directly to Supabase Database
    try {
      await supabaseDb.saveTestBundle(bundle);
    } catch (err) {
      console.warn('Database save warning:', err);
    }

    return bundle;
  },

  /**
   * Admin Invalidate Access Code
   */
  async invalidateAccessCode(testId: string): Promise<void> {
    const bundles = getStoredTestBundles();
    const found = bundles.find((b) => b.test.id === testId);
    if (found) {
      found.test.is_code_active = false;
      saveStoredTestBundles(bundles);
    }
    try {
      await supabaseDb.invalidateAccessCode(testId);
    } catch (err) {
      console.warn('Database invalidate notice:', err);
    }
  },

  /**
   * Admin Regenerate Access Code
   */
  async regenerateAccessCode(testId: string): Promise<string> {
    const bundles = getStoredTestBundles();
    const found = bundles.find((b) => b.test.id === testId);
    const newCode = generateAccessCode();
    if (found) {
      found.test.access_code = newCode;
      found.test.is_code_active = true;
      saveStoredTestBundles(bundles);
    }
    try {
      await supabaseDb.regenerateAccessCode(testId);
    } catch (err) {
      console.warn('Database regenerate notice:', err);
    }
    return newCode;
  },

  /**
   * Delete a Question from Supabase & Local Cache
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    try {
      await supabaseDb.deleteQuestion(questionId);
    } catch (err) {
      console.warn('Database delete question notice:', err);
    }
    return true;
  },

  /**
   * Delete a Section
   */
  async deleteSection(testId: string, sectionId: string): Promise<boolean> {
    const bundles = getStoredTestBundles();
    const found = bundles.find((b) => b.test.id === testId);
    if (found) {
      found.sections = found.sections.filter((s) => s.id !== sectionId);
      saveStoredTestBundles(bundles);
    }
    try {
      await supabaseDb.deleteSection(sectionId);
    } catch (err) {
      console.warn('Database section delete notice:', err);
    }
    return true;
  },

  /**
   * Update Test Status (Publish / Activate / Close) — Persists to Database
   */
  async updateTestStatus(testId: string, status: TestStatus): Promise<Test | null> {
    const bundles = getStoredTestBundles();
    const found = bundles.find((b) => b.test.id === testId);
    if (!found) return null;

    found.test.status = status;
    if (status === 'ACTIVE' && !found.test.access_code) {
      found.test.access_code = generateAccessCode();
    }

    found.test.updated_at = new Date().toISOString();
    saveStoredTestBundles(bundles);

    // Persist published/active status directly to Supabase Database
    try {
      await supabaseDb.updateTestStatus(testId, status);
    } catch (err) {
      console.warn('Database update status warning:', err);
    }

    return found.test;
  },

  /**
   * Delete a Test from Database and Local Store
   */
  async deleteTest(testId: string): Promise<boolean> {
    const bundles = getStoredTestBundles();
    const filtered = bundles.filter((b) => b.test.id !== testId);
    saveStoredTestBundles(filtered);

    try {
      await supabaseDb.deleteTest(testId);
    } catch (err) {
      console.warn('Database delete warning:', err);
    }

    return true;
  },

  /**
   * Start a candidate attempt — Persists directly to Supabase Database & Local Storage
   */
  async startAttempt(testId: string, candidateName: string, candidateEmail?: string): Promise<Attempt> {
    const bundle = await this.getTestFullDetails(testId);
    if (!bundle) throw new Error('Test not found.');

    // Increment code usage counter
    bundle.test.code_current_uses = (bundle.test.code_current_uses || 0) + 1;
    await this.saveTestBundle(bundle);

    let newAttempt: Attempt;
    try {
      newAttempt = await supabaseDb.startAttempt(testId, candidateName, candidateEmail);
    } catch (e) {
      const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const startedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + bundle.test.duration_minutes * 60 * 1000).toISOString();
      newAttempt = {
        id: attemptId,
        test_id: testId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        status: 'IN_PROGRESS',
        started_at: startedAt,
        expires_at: expiresAt,
        score: 0,
        max_score: 0,
        percentage: 0,
        created_at: startedAt,
        answers: {},
      };
    }

    const attempts = getStoredAttempts();
    attempts[newAttempt.id] = newAttempt;
    saveStoredAttempts(attempts);

    return newAttempt;
  },

  /**
   * Get an attempt by ID — Queries Supabase Database first
   */
  async getAttempt(attemptId: string): Promise<Attempt | null> {
    try {
      const dbAttempt = await supabaseDb.getAttempt(attemptId);
      if (dbAttempt) return dbAttempt;
    } catch (e) {}

    const attempts = getStoredAttempts();
    return attempts[attemptId] || null;
  },

  /**
   * Save / Autosave answer for a candidate question — Persists to Supabase & Local Cache
   */
  async saveAnswer(
    attemptId: string,
    questionId: string,
    payload: { selectedOptionIds?: string[]; textAnswer?: string; isMarkedForReview?: boolean }
  ): Promise<Answer> {
    // 1. Persist to Supabase PostgreSQL Database
    try {
      await supabaseDb.saveAnswer(attemptId, questionId, payload);
    } catch (e) {}

    // 2. Persist to Local Storage Cache
    const attempts = getStoredAttempts();
    const attempt = attempts[attemptId];
    if (attempt) {
      if (!attempt.answers) attempt.answers = {};
      const existing = attempt.answers[questionId] || {
        id: `ans-${attemptId}-${questionId}`,
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_ids: [],
        text_answer: '',
        is_marked_for_review: false,
        updated_at: new Date().toISOString(),
      };

      if (payload.selectedOptionIds !== undefined) {
        existing.selected_option_ids = payload.selectedOptionIds;
      }
      if (payload.textAnswer !== undefined) {
        existing.text_answer = payload.textAnswer;
      }
      if (payload.isMarkedForReview !== undefined) {
        existing.is_marked_for_review = payload.isMarkedForReview;
      }

      existing.updated_at = new Date().toISOString();
      attempt.answers[questionId] = existing;
      attempt.current_question_id = questionId;

      saveStoredAttempts(attempts);
      return existing;
    }

    return {
      id: `ans-${attemptId}-${questionId}`,
      attempt_id: attemptId,
      question_id: questionId,
      selected_option_ids: payload.selectedOptionIds || [],
      text_answer: payload.textAnswer || '',
      is_marked_for_review: payload.isMarkedForReview || false,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Submit an attempt & auto-score — Persists to Supabase Database
   */
  async submitAttempt(attemptId: string, forceExpired = false, answersMapOverride?: Record<string, Answer>): Promise<Attempt> {
    const attempt = await this.getAttempt(attemptId);
    if (!attempt) throw new Error('Attempt not found.');

    const bundle = await this.getTestFullDetails(attempt.test_id);
    if (!bundle) throw new Error('Test definition missing.');

    const activeAnswers = answersMapOverride || attempt.answers || {};

    let submittedAttempt: Attempt;
    try {
      submittedAttempt = await supabaseDb.submitAttempt(attemptId, activeAnswers, bundle);
      if (forceExpired) {
        submittedAttempt.status = 'EXPIRED';
      }
    } catch (e) {
      const allQuestions: Question[] = [];
      bundle.sections.forEach((s) => allQuestions.push(...s.questions));
      const scoreResult = calculateAttemptScore(allQuestions, activeAnswers);

      submittedAttempt = {
        ...attempt,
        status: forceExpired ? 'EXPIRED' : 'SUBMITTED',
        submitted_at: new Date().toISOString(),
        score: scoreResult.score,
        max_score: scoreResult.maxScore,
        percentage: scoreResult.percentage,
        answers: activeAnswers,
      };
    }

    const attempts = getStoredAttempts();
    attempts[attemptId] = submittedAttempt;
    saveStoredAttempts(attempts);

    return submittedAttempt;
  },

  /**
   * Log Candidate Event for Admin Monitoring
   */
  async logEvent(attemptId: string, eventType: string, payload: Record<string, any>): Promise<EventLog> {
    try {
      return await supabaseDb.logEvent(attemptId, eventType, payload);
    } catch (e) {
      return {
        id: `evt-${Date.now()}`,
        attempt_id: attemptId,
        event_type: eventType as any,
        payload,
        created_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch Real-time Event Logs for Monitoring
   */
  async getEventLogs(attemptId: string): Promise<EventLog[]> {
    try {
      const logs = await supabaseDb.getEventLogs(attemptId);
      if (logs && logs.length > 0) return logs;
    } catch (e) {}
    return [];
  },

  /**
   * Get all candidate attempts for a specific test (for Admin Monitoring & Analytics)
   */
  async getTestAttempts(testId: string): Promise<Attempt[]> {
    try {
      const dbAttempts = await supabaseDb.getTestAttempts(testId);
      if (dbAttempts && dbAttempts.length > 0) return dbAttempts;
    } catch (e) {}

    const attempts = getStoredAttempts();
    return Object.values(attempts).filter((a) => a.test_id === testId);
  },
};
