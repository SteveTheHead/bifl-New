-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('website_bug', 'product_suggestion', 'data_correction', 'general_idea')),
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  attachment_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Create index on feedback_type for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (anonymous or authenticated)
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view their own feedback (based on email)
CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (contact_email = auth.email());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

COMMENT ON TABLE feedback IS 'Stores user feedback submissions';
COMMENT ON COLUMN feedback.feedback_type IS 'Type of feedback: website_bug, product_suggestion, data_correction, general_idea';
COMMENT ON COLUMN feedback.subject IS 'Brief subject line of the feedback';
COMMENT ON COLUMN feedback.details IS 'Detailed description of the feedback';
COMMENT ON COLUMN feedback.attachment_url IS 'Optional URL to uploaded attachment (if any)';
COMMENT ON COLUMN feedback.contact_name IS 'Optional name of person submitting feedback';
COMMENT ON COLUMN feedback.contact_email IS 'Optional email of person submitting feedback';
COMMENT ON COLUMN feedback.status IS 'Current status: new, in_review, resolved, closed';
