-- Create signup_links table
CREATE TABLE IF NOT EXISTS signup_links (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  url TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  created_by TEXT,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_signup_links_account_id ON signup_links(account_id);
CREATE INDEX IF NOT EXISTS idx_signup_links_active ON signup_links(active);
CREATE INDEX IF NOT EXISTS idx_signup_links_expires_at ON signup_links(expires_at);

-- Create conversions table to track link usage
CREATE TABLE IF NOT EXISTS link_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL,
  account_id TEXT,
  converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_name TEXT,
  user_email TEXT,
  user_ip TEXT,
  FOREIGN KEY (link_id) REFERENCES signup_links(id)
);

CREATE INDEX IF NOT EXISTS idx_conversions_link_id ON link_conversions(link_id);
CREATE INDEX IF NOT EXISTS idx_conversions_converted_at ON link_conversions(converted_at);
