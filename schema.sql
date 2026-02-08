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

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT,
  description_id TEXT,
  description_en TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT -1,
  sold INTEGER DEFAULT 0,
  is_digital INTEGER DEFAULT 0,
  download_url TEXT,
  download_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT,
  merchant_ref TEXT,                -- Linked to orders.merchant_ref
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  reference TEXT,                   -- Tripay reference (Not unique, shared by items in order)
  tripay_reference TEXT,            -- Tripay merchant ref (legacy/duplicate?)
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  library_token TEXT UNIQUE,        -- PERMANENT ACCESS TOKEN
  download_token TEXT UNIQUE,       -- SECURE DOWNLOAD TOKEN
  download_expires DATETIME,
  downloads_used INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);

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

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  merchant_ref TEXT UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  amount INTEGER,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'UNPAID',
  tripay_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  order_items TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_library ON transactions(library_token);
CREATE INDEX IF NOT EXISTS idx_transactions_download ON transactions(download_token);
