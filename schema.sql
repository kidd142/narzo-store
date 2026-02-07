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
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT,
  description_id TEXT,
  description_en TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  -- Stock management
  stock INTEGER DEFAULT -1,           -- -1 = unlimited
  sold INTEGER DEFAULT 0,
  -- Digital product
  is_digital INTEGER DEFAULT 0,
  download_url TEXT,                  -- R2 or external link
  download_count INTEGER DEFAULT 0,
  -- Status
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending, paid, expired, failed
  payment_method TEXT,
  reference TEXT UNIQUE,              -- Tripay reference
  tripay_reference TEXT,              -- Tripay merchant ref
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  -- Digital delivery
  download_token TEXT UNIQUE,         -- For secure download link
  download_expires DATETIME,          -- Token expiry
  downloads_used INTEGER DEFAULT 0,   -- Track download count
  max_downloads INTEGER DEFAULT 3,    -- Limit downloads
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);

-- Downloads log (track each download)
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  page_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);