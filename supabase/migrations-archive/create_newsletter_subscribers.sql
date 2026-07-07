-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create index on subscribed status
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed);

-- Add RLS (Row Level Security) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow reading own subscription (if authenticated)
CREATE POLICY "Users can view their own subscription"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Allow updating own subscription
CREATE POLICY "Users can update their own subscription"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (auth.email() = email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

COMMENT ON TABLE newsletter_subscribers IS 'Stores email addresses for newsletter subscriptions';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address (unique and lowercase)';
COMMENT ON COLUMN newsletter_subscribers.subscribed IS 'Whether the user is currently subscribed';
COMMENT ON COLUMN newsletter_subscribers.subscribed_at IS 'When the user first subscribed or last resubscribed';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'When the user unsubscribed (if applicable)';
