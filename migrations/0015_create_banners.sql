-- Migration: Create banners table for public sharing
-- Created: 2026-03-03

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  link_url TEXT NOT NULL,
  qr_code_base64 TEXT,
  banner_image_base64 TEXT,
  title TEXT,
  description TEXT,
  value REAL,
  promo TEXT,
  button_text TEXT,
  color TEXT DEFAULT 'orange',
  charge_type TEXT DEFAULT 'monthly',
  is_custom_banner INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_account_id ON banners(account_id);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at);
