import { getSupabaseClient } from '../lib/supabase';
import {
  Test,
  Section,
  Question,
  Option,
  Passage,
  Attempt,
  Answer,
  TestStatus,
  TestFullDetails,
} from '../types/database';
import { generateAccessCode } from './timer';
import { calculateAttemptScore } from './scoring';

/**
 * Direct Supabase PostgreSQL Database Integration
 * Persists all created, edited, and published tests directly to Supabase PostgreSQL database tables.
 */
export const supabaseDb = {
  /**
   * Fetch all tests from Supabase PostgreSQL database
   */
  async getTests(): Promise<Test[]> {
    const client = getSupabaseClient();
    const { data: tests, error } = await client
      .from('tests')
      .select('*, sections(count), attempts(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch tests notice:', error.message);
      return [];
    }

    return (tests || []).map((t: any) => ({
      ...t,
      sections_count: t.sections ? t.sections[0]?.count || 0 : 0,
      questions_count: 0,
      active_candidates_count: t.attempts ? t.attempts[0]?.count || 0 : 0,
    }));
  },

  /**
   * Fetch test by Access Code from Supabase
   */
  async getTestByAccessCode(code: string): Promise<TestFullDetails | null> {
    const cleanCode = code.trim().toUpperCase();
    const client = getSupabaseClient();
    const { data: test, error } = await client
      .from('tests')
      .select('id')
      .ilike('access_code', cleanCode)
      .maybeSingle();

    if (error || !test) return null;
    return this.getTestFullDetails(test.id);
  },

  /**
   * Fetch complete test bundle (Test, Sections, Passages, Questions, Options) from Supabase
   */
  async getTestFullDetails(testId: string): Promise<TestFullDetails | null> {
    const client = getSupabaseClient();
    const { data: test, error: tErr } = await client
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (tErr || !test) return null;

    const { data: sections } = await client
      .from('sections')
      .select('*')
      .eq('test_id', testId)
      .order('position', { ascending: true });

    const fullSections: (Section & { questions: Question[]; passages: Passage[] })[] = [];

    for (const sec of sections || []) {
      const { data: passages } = await client
        .from('passages')
        .select('*')
        .eq('section_id', sec.id)
        .order('position', { ascending: true });

      const { data: questions } = await client
        .from('questions')
        .select('*')
        .eq('section_id', sec.id)
        .order('position', { ascending: true });

      const fullQuestions: Question[] = [];
      for (const q of questions || []) {
        const { data: options } = await client
          .from('options')
          .select('*')
          .eq('question_id', q.id)
          .order('position', { ascending: true });

        fullQuestions.push({
          ...q,
          options: options || [],
        });
      }

      fullSections.push({
        ...sec,
        passages: passages || [],
        questions: fullQuestions,
      });
    }

    return {
      test,
      sections: fullSections,
    };
  },

  /**
   * Save / Upsert full test bundle into Supabase PostgreSQL database
   */
  async saveTestBundle(bundle: TestFullDetails): Promise<TestFullDetails> {
    const client = getSupabaseClient();
    const { test, sections } = bundle;

    // 1. Upsert Test row
    const { error: testErr } = await client.from('tests').upsert({
      id: test.id,
      title: test.title,
      description: test.description,
      instructions: test.instructions,
      duration_minutes: test.duration_minutes,
      status: test.status,
      access_code: test.access_code || generateAccessCode(),
      code_expires_at: test.code_expires_at || null,
      code_max_uses: test.code_max_uses !== undefined ? test.code_max_uses : null,
      code_current_uses: test.code_current_uses || 0,
      is_code_active: test.is_code_active !== false,
      max_attempts: test.max_attempts,
      result_visibility: test.result_visibility,
      randomize_questions: test.randomize_questions,
      randomize_options: test.randomize_options,
      updated_at: new Date().toISOString(),
    });

    if (testErr) {
      console.error('Error saving test to Supabase:', testErr);
      throw new Error(`Failed to save test details: ${testErr.message}`);
    }

    // 2. Upsert Sections, Passages, Questions, Options
    for (const sec of sections) {
      const { error: secErr } = await client.from('sections').upsert({
        id: sec.id,
        test_id: test.id,
        title: sec.title,
        description: sec.description,
        position: sec.position,
      });
      if (secErr) throw new Error(`Failed to save section "${sec.title}": ${secErr.message}`);

      for (const pas of sec.passages || []) {
        const { error: pasErr } = await client.from('passages').upsert({
          id: pas.id,
          section_id: sec.id,
          title: pas.title,
          content: pas.content,
          position: pas.position,
        });
        if (pasErr) console.warn('Passage save warning:', pasErr);
      }

      // Sync questions by pruning any deleted questions for this section from Supabase
      const currentQuestionIds = (sec.questions || []).map((q) => q.id);
      if (currentQuestionIds.length > 0) {
        const { data: dbQs } = await client.from('questions').select('id').eq('section_id', sec.id);
        if (dbQs && dbQs.length > 0) {
          const toDelete = dbQs.filter((item) => !currentQuestionIds.includes(item.id));
          for (const item of toDelete) {
            await client.from('questions').delete().eq('id', item.id);
          }
        }
      } else {
        await client.from('questions').delete().eq('section_id', sec.id);
      }

      for (const q of sec.questions || []) {
        const { error: qErr } = await client.from('questions').upsert({
          id: q.id,
          section_id: sec.id,
          passage_id: q.passage_id || null,
          question_type: q.question_type,
          prompt: q.prompt,
          image_url: q.image_url || null,
          image_urls: q.image_urls || null,
          quantity_a: q.quantity_a || null,
          quantity_b: q.quantity_b || null,
          numeric_answer: q.numeric_answer !== undefined ? q.numeric_answer : null,
          numeric_tolerance: q.numeric_tolerance || 0,
          explanation: q.explanation || null,
          points: q.points || 1.0,
          position: q.position,
        });
        if (qErr) throw new Error(`Failed to save question: ${qErr.message}`);

        // Sync options
        await client.from('options').delete().eq('question_id', q.id);
        for (const opt of q.options || []) {
          await client.from('options').insert({
            id: opt.id,
            question_id: q.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            position: opt.position,
          });
        }
      }
    }

    return bundle;
  },

  /**
   * Admin Invalidate Access Code in Supabase
   */
  async invalidateAccessCode(testId: string): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('tests').update({ is_code_active: false }).eq('id', testId);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Admin Regenerate Access Code in Supabase
   */
  async regenerateAccessCode(testId: string): Promise<string> {
    const client = getSupabaseClient();
    const newCode = generateAccessCode();
    try {
      await client.from('tests').update({ access_code: newCode, is_code_active: true }).eq('id', testId);
    } catch (e) {}
    return newCode;
  },

  /**
   * Delete a Question from Supabase PostgreSQL database
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('options').delete().eq('question_id', questionId);
      await client.from('questions').delete().eq('id', questionId);
      return true;
    } catch (e) {
      console.warn('Error deleting question from Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a Section from Supabase
   */
  async deleteSection(sectionId: string): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('questions').delete().eq('section_id', sectionId);
      await client.from('sections').delete().eq('id', sectionId);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Update Test Status in Supabase
   */
  async updateTestStatus(testId: string, status: TestStatus): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('tests').update({ status, updated_at: new Date().toISOString() }).eq('id', testId);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Delete a Test from Supabase
   */
  async deleteTest(testId: string): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('tests').delete().eq('id', testId);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Start a candidate test attempt in Supabase
   */
  async startAttempt(testId: string, candidateName: string, candidateEmail?: string): Promise<Attempt> {
    const client = getSupabaseClient();
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const newAttempt: Attempt = {
      id: attemptId,
      test_id: testId,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      started_at: now,
      expires_at: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      status: 'IN_PROGRESS',
      score: 0,
      max_score: 0,
      percentage: 0,
      created_at: now,
    };

    const { error } = await client.from('attempts').insert(newAttempt);
    if (error) {
      console.warn('Supabase start attempt notice:', error.message);
    }

    return newAttempt;
  },

  /**
   * Submit attempt answers to Supabase
   */
  async submitAttempt(
    attemptId: string,
    answersMap: Record<string, Answer>,
    testBundle: TestFullDetails
  ): Promise<Attempt> {
    const client = getSupabaseClient();
    const allQuestions: Question[] = testBundle.sections.flatMap((s) => s.questions || []);
    const scored = calculateAttemptScore(allQuestions, answersMap);
    const now = new Date().toISOString();

    const { data: attempt } = await client
      .from('attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    const updatedAttempt: Attempt = {
      ...(attempt || {}),
      id: attemptId,
      test_id: testBundle.test.id,
      candidate_name: attempt?.candidate_name || 'Candidate',
      candidate_email: attempt?.candidate_email,
      started_at: attempt?.started_at || now,
      expires_at: attempt?.expires_at || now,
      submitted_at: now,
      status: 'SUBMITTED',
      score: scored.score,
      max_score: scored.maxScore,
      percentage: scored.percentage,
      created_at: attempt?.created_at || now,
    };

    await client.from('attempts').upsert(updatedAttempt);
    return updatedAttempt;
  },

  /**
   * Fetch attempts for a test from Supabase
   */
  async getTestAttempts(testId: string): Promise<Attempt[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('attempts')
      .select('*')
      .eq('test_id', testId)
      .order('started_at', { ascending: false });

    if (error) return [];
    return data || [];
  },
};
