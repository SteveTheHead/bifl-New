CREATE TABLE IF NOT EXISTS user_recently_viewed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_email, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_user_email ON user_recently_viewed(user_email);
CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_viewed_at ON user_recently_viewed(viewed_at);
