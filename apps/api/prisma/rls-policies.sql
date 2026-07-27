-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Row Level Security (RLS) Policies for NEET AI Platform
-- Run this script in Supabase SQL Editor or via Prisma Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own profile" ON profiles
  FOR ALL USING (auth.uid()::text = auth_user_id);

-- 2. Study Stats
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own study stats" ON study_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = study_stats.profile_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 3. Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own uploaded documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = documents.profile_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 4. Tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own test sessions" ON tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = tests.user_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 5. Student Answers
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own test answers" ON student_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_answers.user_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 6. Results
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own test results" ON results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tests
      JOIN profiles ON profiles.id = tests.user_id
      WHERE tests.id = results.test_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 7. Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own test reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tests
      JOIN profiles ON profiles.id = tests.user_id
      WHERE tests.id = reports.test_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );

-- 8. AI Jobs
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own background AI jobs" ON ai_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = ai_jobs.user_id
      AND profiles.auth_user_id = auth.uid()::text
    )
  );