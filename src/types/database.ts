// TypeScript Interfaces & Database Schema Models

export type TestStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED';
export type ResultVisibility = 'IMMEDIATE' | 'AFTER_SUBMISSION' | 'ADMIN_ONLY';
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'QUANTITATIVE_COMPARISON'
  | 'NUMERIC_ENTRY'
  | 'TEXT_COMPLETION'
  | 'SENTENCE_EQUIVALENCE'
  | 'READING_COMPREHENSION'
  | 'ANALYTICAL_WRITING';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'FORCE_SUBMITTED';

export interface EssayFeedback {
  score: number; // 0.0 to 6.0 scale in 0.5 increments
  summary: string;
  strengths: string[];
  weaknesses: string[];
  detailed_feedback: string;
  improvement_tips: string[];
  evaluated_at?: string;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_ids: string[];
  text_answer?: string;
  is_marked_for_review: boolean;
  is_correct?: boolean;
  score_awarded?: number;
  essay_feedback?: EssayFeedback;
  updated_at: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration_minutes: number;
  status: TestStatus;
  access_code?: string;
  code_expires_at?: string; // Optional time-bounded expiration (ISO timestamp)
  code_max_uses?: number; // Optional number of uses bound
  code_current_uses?: number; // Tracks current candidate joins
  is_code_active?: boolean; // Admin invalidation flag
  max_attempts: number;
  result_visibility: ResultVisibility;
  randomize_questions: boolean;
  randomize_options: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  sections_count?: number;
  questions_count?: number;
  active_candidates_count?: number;
}

export interface Section {
  id: string;
  test_id: string;
  title: string;
  description: string;
  duration_minutes?: number;
  position: number;
  created_at: string;
  questions?: Question[];
  passages?: Passage[];
}

export interface Passage {
  id: string;
  section_id: string;
  title?: string;
  content: string;
  position: number;
  created_at: string;
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  image_url?: string;
  image_urls?: string[];
  is_correct: boolean;
  position: number;
}

export interface Question {
  id: string;
  section_id: string;
  passage_id?: string;
  question_type: QuestionType;
  prompt: string;
  image_url?: string;
  image_urls?: string[];
  quantity_a?: string;
  quantity_b?: string;
  quantity_a_image?: string;
  quantity_a_images?: string[];
  quantity_b_image?: string;
  quantity_b_images?: string[];
  numeric_answer?: number;
  accepted_numeric_answers?: number[]; // Multiple accepted numeric right answers
  numeric_tolerance?: number;
  explanation?: string;
  points: number;
  position: number;
  created_at: string;
  updated_at: string;
  options?: Option[];
  passage?: Passage;
}

export interface Attempt {
  id: string;
  test_id: string;
  candidate_name: string;
  candidate_email?: string;
  status: AttemptStatus;
  started_at: string;
  expires_at: string;
  submitted_at?: string;
  current_question_id?: string;
  score: number;
  max_score: number;
  percentage: number;
  created_at: string;
  answers?: Record<string, Answer>; // Keyed by question_id
}



export interface EventLog {
  id: string;
  attempt_id: string;
  event_type: 'SESSION_START' | 'ANSWER_SAVE' | 'QUESTION_CHANGE' | 'MARK_REVIEW' | 'SUBMIT' | 'EXPIRE' | 'FORCE_SUBMIT';
  payload: Record<string, any>;
  created_at: string;
}

// Helper structure for test bundle loading
export interface TestFullDetails {
  test: Test;
  sections: (Section & {
    questions: Question[];
    passages: Passage[];
  })[];
}
