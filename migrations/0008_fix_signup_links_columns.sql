-- Migration 0008: Add missing columns to signup_links
-- Created: 2026-02-19

-- Add missing columns to signup_links (IF they don't exist)
-- SQLite doesn't have IF NOT EXISTS for columns, so we'll try to add them
-- If they exist, the error is ignored by using OR statements

-- Note: We cannot use IF NOT EXISTS for ALTER TABLE ADD COLUMN in SQLite
-- So we create a new table with all columns and copy data

-- Create temporary backup
CREATE TABLE IF NOT EXISTS signup_links_backup AS SELECT * FROM signup_links;

-- Drop old table
DROP TABLE IF EXISTS signup_links;

-- Recreate with all columns
CREATE TABLE signup_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  account_id TEXT NOT NULL,
  url TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  notes TEXT,
  qr_code TEXT
);

-- Restore data from backup (without qr_code since it doesn't exist in old table)
INSERT INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count, max_uses, created_by, notes)
SELECT 
  id, 
  account_id, 
  url, 
  expires_at, 
  created_at, 
  COALESCE(active, 1),
  COALESCE(uses_count, 0),
  max_uses,
  COALESCE(created_by, 'admin'),
  notes
FROM signup_links_backup;

-- Drop backup
DROP TABLE signup_links_backup;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_signup_links_account ON signup_links(account_id);
CREATE INDEX IF NOT EXISTS idx_signup_links_active ON signup_links(active);
CREATE INDEX IF NOT EXISTS idx_signup_links_expires ON signup_links(expires_at);
