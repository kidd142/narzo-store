-- Narzo Blog Schema (Blog-Only)
-- Last Updated: 2026-02-09

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT,
  excerpt_id TEXT,
  excerpt_en TEXT,
  content_id TEXT,
  content_en TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT,
  author TEXT DEFAULT 'Admin',
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  enable_ads INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT,
  parent_id TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  page_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
