import { supabase } from '../lib/supabase';
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
    const { data: tests, error } = await supabase
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
   * Fetch complete test bundle (Test, Sections, Passages, Questions, Options) from Supabase
   */
  async getTestFullDetails(testId: string): Promise<TestFullDetails | null> {
    const { data: test, error: tErr } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (tErr || !test) return null;

    const { data: sections } = await supabase
      .from('sections')
      .select('*')
      .eq('test_id', testId)
      .order('position', { ascending: true });

    const fullSections: (Section & { questions: Question[]; passages: Passage[] })[] = [];

    for (const sec of sections || []) {
      const { data: passages } = await supabase
        .from('passages')
        .select('*')
        .eq('section_id', sec.id)
        .order('position', { ascending: true });

      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('section_id', sec.id)
        .order('position', { ascending: true });

      const fullQuestions: Question[] = [];
      for (const q of questions || []) {
        const { data: options } = await supabase
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
    const { test, sections } = bundle;

    // 1. Upsert Test row
    const { error: testErr } = await supabase.from('tests').upsert({
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
      const { error: secErr } = await supabase.from('sections').upsert({
        id: sec.id,
        test_id: test.id,
        title: sec.title,
        description: sec.description,
        position: sec.position,
      });
      if (secErr) throw new Error(`Failed to save section "${sec.title}": ${secErr.message}`);

      for (const pas of sec.passages || []) {
        const { error: pasErr } = await supabase.from('passages').upsert({
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
        // Fetch existing question IDs in Supabase for this section
        const { data: dbQs } = await supabase.from('questions').select('id').eq('section_id', sec.id);
        if (dbQs && dbQs.length > 0) {
          const toDelete = dbQs.filter((item) => !currentQuestionIds.includes(item.id));
          for (const item of toDelete) {
            await supabase.from('questions').delete().eq('id', item.id);
          }
        }
      } else {
        await supabase.from('questions').delete().eq('section_id', sec.id);
      }

      for (const q of sec.questions || []) {
        const { error: qErr } = await supabase.from('questions').upsert({
          id: q.id,
          section_id: sec.id,
          passage_id: q.passage_id || null,
          question_type: q.question_type,
          prompt: q.prompt,
          image_url: q.image_url || null,
          image_urls: q.image_urls || null,
          quantity_a: q.quantity_a || null,
          quantity_b: q.quantity_b || null,
          quantity_a_image: q.quantity_a_image || null,
          quantity_a_images: q.quantity_a_images || null,
          quantity_b_image: q.quantity_b_image || null,
          quantity_b_images: q.quantity_b_images || null,
          numeric_answer: q.numeric_answer !== undefined ? q.numeric_answer : null,
          accepted_numeric_answers: q.accepted_numeric_answers || null,
          numeric_tolerance: q.numeric_tolerance !== undefined ? q.numeric_tolerance : null,
          explanation: q.explanation || null,
          points: q.points,
          position: q.position,
          updated_at: new Date().toISOString(),
        });

        if (qErr) {
          console.error(`Error saving question ${q.id} to Supabase:`, qErr);
          throw new Error(`Failed to save question "${q.prompt.slice(0, 25)}...": ${qErr.message}`);
        }

        // Save options for this question
        for (const opt of q.options || []) {
          const { error: optErr } = await supabase.from('options').upsert({
            id: opt.id,
            question_id: q.id,
            option_text: opt.option_text,
            image_url: opt.image_url || null,
            image_urls: opt.image_urls || null,
            is_correct: opt.is_correct,
            position: opt.position,
          });
          if (optErr) console.warn(`Option save warning for option ${opt.id}:`, optErr);
        }
      }
    }

    return bundle;
  },

  /**
   * Delete Question from Supabase
   */
  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) console.error('Error deleting question from Supabase:', error);
  },

  /**
   * Delete Section from Supabase
   */
  async deleteSection(sectionId: string): Promise<void> {
    await supabase.from('sections').delete().eq('id', sectionId);
  },

  /**
   * Invalidate Access Code (Admin action)
   */
  async invalidateAccessCode(testId: string): Promise<void> {
    await supabase.from('tests').update({ is_code_active: false, updated_at: new Date().toISOString() }).eq('id', testId);
  },

  /**
   * Regenerate Access Code (Admin action)
   */
  async regenerateAccessCode(testId: string): Promise<string> {
    const newCode = generateAccessCode();
    await supabase.from('tests').update({ access_code: newCode, is_code_active: true, updated_at: new Date().toISOString() }).eq('id', testId);
    return newCode;
  },

  /**
   * Update Test Status in Supabase (e.g. Publish / Activate / Close)
   */
  async updateTestStatus(testId: string, status: TestStatus): Promise<void> {
    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'ACTIVE') {
      const code = generateAccessCode();
      payload.access_code = code;
    }

    await supabase.from('tests').update(payload).eq('id', testId);
  },

  /**
   * Delete Test from Supabase
   */
  async deleteTest(testId: string): Promise<void> {
    await supabase.from('tests').delete().eq('id', testId);
  },
};
