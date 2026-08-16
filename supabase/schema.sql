-- Online Test & Quiz Platform Robust Schema & Migration Script for Supabase PostgreSQL
-- Safe to re-run multiple times on new or existing database schemas

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safe Enum Creations
DO $$ BEGIN
  CREATE TYPE test_status AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ACTIVE', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE result_visibility AS ENUM ('IMMEDIATE', 'AFTER_SUBMISSION', 'ADMIN_ONLY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM (
    'MULTIPLE_CHOICE',
    'QUANTITATIVE_COMPARISON',
    'NUMERIC_ENTRY',
    'TEXT_COMPLETION',
    'SENTENCE_EQUIVALENCE',
    'READING_COMPREHENSION'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'FORCE_SUBMITTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 35,
  status test_status NOT NULL DEFAULT 'DRAFT',
  access_code VARCHAR(10) UNIQUE,
  code_expires_at TIMESTAMPTZ,
  code_max_uses INTEGER,
  code_current_uses INTEGER DEFAULT 0,
  is_code_active BOOLEAN DEFAULT TRUE,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  result_visibility result_visibility NOT NULL DEFAULT 'AFTER_SUBMISSION',
  randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
  randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure code bounds columns exist if tests table pre-existed
ALTER TABLE tests ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS code_max_uses INTEGER;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS code_current_uses INTEGER DEFAULT 0;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_code_active BOOLEAN DEFAULT TRUE;

-- 2. Sections Table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Passages Table (for Reading Comprehension)
CREATE TABLE IF NOT EXISTS passages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Ensure section_id column exists if passages table pre-existed
ALTER TABLE passages ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE CASCADE;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  question_type question_type NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  quantity_a TEXT,
  quantity_b TEXT,
  quantity_a_image TEXT,
  quantity_b_image TEXT,
  numeric_answer NUMERIC,
  accepted_numeric_answers NUMERIC[],
  numeric_tolerance NUMERIC DEFAULT 0,
  explanation TEXT,
  points NUMERIC NOT NULL DEFAULT 1.0,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Ensure section_id & passage_id columns exist if questions table pre-existed
ALTER TABLE questions ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE CASCADE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage_id UUID REFERENCES passages(id) ON DELETE SET NULL;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS accepted_numeric_answers NUMERIC[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS quantity_a_image TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS quantity_b_image TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS quantity_a_images TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS quantity_b_images TEXT[];

-- 5. Options Table (for Multiple Choice & Sentence Equivalence)
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  image_url TEXT,
  image_urls TEXT[],
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE options ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE options ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES questions(id) ON DELETE CASCADE;

-- 6. Attempts Table (Candidate test sessions)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  status attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  current_question_id UUID,
  score NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS test_id UUID REFERENCES tests(id) ON DELETE CASCADE;

-- 7. Answers Table (Persisted Candidate Responses)
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[] DEFAULT '{}',
  text_answer TEXT,
  is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_correct BOOLEAN,
  score_awarded NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- 8. Event Logs (Audit trail for candidate activity)
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe Indexes
CREATE INDEX IF NOT EXISTS idx_tests_access_code ON tests(access_code);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_passage ON questions(passage_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);

-- Storage bucket for test images
INSERT INTO storage.buckets (id, name, public) VALUES ('test-images', 'test-images', true) ON CONFLICT (id) DO NOTHING;

-- Safe Storage policies
DO $$ BEGIN
  CREATE POLICY "Public Read Test Images" ON storage.objects FOR SELECT USING (bucket_id = 'test-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin Upload Test Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'test-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 9. Admin Users Table (Dynamic & Persisted Administrator Accounts)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMINISTRATOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Master Admin if missing (admin@preppulse.com / admin123)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('admin@preppulse.com', 'admin123', 'Lead Test Administrator', 'ADMINISTRATOR')
ON CONFLICT (email) DO NOTHING;
