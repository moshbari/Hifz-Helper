-- Hifz Helper Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- Note: Supabase auth handles the users table, we just reference it

-- Hifz Attempts table - stores all practice attempts
CREATE TABLE IF NOT EXISTS hifz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  surah_name TEXT NOT NULL,
  verse_start INTEGER NOT NULL CHECK (verse_start >= 1),
  verse_end INTEGER NOT NULL CHECK (verse_end >= verse_start),
  transcription TEXT,
  original_text TEXT,
  accuracy INTEGER CHECK (accuracy >= 0 AND accuracy <= 100),
  word_results JSONB,
  errors JSONB,
  duration INTEGER, -- in seconds
  status TEXT DEFAULT 'needs_review' CHECK (status IN ('passed', 'needs_review', 'pending')),
  teacher_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hifz_attempts_user_id ON hifz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_hifz_attempts_surah ON hifz_attempts(surah_number);
CREATE INDEX IF NOT EXISTS idx_hifz_attempts_created_at ON hifz_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hifz_attempts_status ON hifz_attempts(status);

-- User settings table
CREATE TABLE IF NOT EXISTS hifz_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'ocean',
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  show_translation BOOLEAN DEFAULT false,
  auto_play_audio BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS hifz_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_number)
);

CREATE INDEX IF NOT EXISTS idx_hifz_favorites_user_id ON hifz_favorites(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE hifz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hifz_attempts
-- Users can read their own attempts
CREATE POLICY "Users can read own attempts"
  ON hifz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON hifz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own attempts
CREATE POLICY "Users can update own attempts"
  ON hifz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own attempts
CREATE POLICY "Users can delete own attempts"
  ON hifz_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Teachers can read all attempts (for review)
CREATE POLICY "Teachers can read all attempts"
  ON hifz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('teacher', 'admin')
    )
  );

-- Teachers can update attempts (for review/feedback)
CREATE POLICY "Teachers can update all attempts"
  ON hifz_attempts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('teacher', 'admin')
    )
  );

-- RLS Policies for hifz_settings
CREATE POLICY "Users can manage own settings"
  ON hifz_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for hifz_favorites
CREATE POLICY "Users can manage own favorites"
  ON hifz_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_hifz_attempts_updated_at
  BEFORE UPDATE ON hifz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hifz_settings_updated_at
  BEFORE UPDATE ON hifz_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for attempt statistics (useful for dashboards)
CREATE OR REPLACE VIEW user_attempt_stats AS
SELECT 
  user_id,
  COUNT(*) as total_attempts,
  AVG(accuracy) as average_accuracy,
  COUNT(*) FILTER (WHERE status = 'passed') as passed_count,
  COUNT(*) FILTER (WHERE status = 'needs_review') as needs_review_count,
  COUNT(DISTINCT surah_number) as unique_surahs,
  MAX(created_at) as last_practice
FROM hifz_attempts
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON user_attempt_stats TO authenticated;
