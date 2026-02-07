-- Migration: Add hierarchical categories
-- Run this on existing D1 database

-- Add parent_id column
ALTER TABLE categories ADD COLUMN parent_id TEXT;

-- Add icon column  
ALTER TABLE categories ADD COLUMN icon TEXT;

-- Insert initial categories structure
-- Parent categories
INSERT OR IGNORE INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order) VALUES
  ('cat-tech', 'technology', 'Teknologi', 'Technology', NULL, '💻', 1),
  ('cat-lifestyle', 'lifestyle', 'Gaya Hidup Digital', 'Digital Lifestyle', NULL, '🌟', 2),
  ('cat-business', 'business', 'Bisnis', 'Business', NULL, '💼', 3),
  ('cat-guides', 'guides', 'Panduan', 'Guides', NULL, '📚', 4);

-- Child categories - Technology
INSERT OR IGNORE INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order) VALUES
  ('cat-tutorials', 'tutorials', 'Tutorial', 'Tutorials', 'cat-tech', '🎓', 1),
  ('cat-reviews', 'reviews', 'Review', 'Reviews', 'cat-tech', '⭐', 2),
  ('cat-news', 'tech-news', 'Berita Tech', 'Tech News', 'cat-tech', '📰', 3),
  ('cat-tips', 'tips-tricks', 'Tips & Trik', 'Tips & Tricks', 'cat-tech', '💡', 4);

-- Child categories - Digital Lifestyle
INSERT OR IGNORE INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order) VALUES
  ('cat-productivity', 'productivity', 'Produktivitas', 'Productivity', 'cat-lifestyle', '⚡', 1),
  ('cat-entertainment', 'entertainment', 'Hiburan', 'Entertainment', 'cat-lifestyle', '🎬', 2),
  ('cat-gaming', 'gaming', 'Gaming', 'Gaming', 'cat-lifestyle', '🎮', 3),
  ('cat-apps', 'apps', 'Aplikasi', 'Apps', 'cat-lifestyle', '📱', 4);

-- Child categories - Business
INSERT OR IGNORE INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order) VALUES
  ('cat-startups', 'startups', 'Startup', 'Startups', 'cat-business', '🚀', 1),
  ('cat-ecommerce', 'ecommerce', 'E-commerce', 'E-commerce', 'cat-business', '🛒', 2),
  ('cat-marketing', 'marketing', 'Marketing', 'Marketing', 'cat-business', '📣', 3);

-- Child categories - Guides
INSERT OR IGNORE INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order) VALUES
  ('cat-howto', 'how-to', 'Cara', 'How-to', 'cat-guides', '🔧', 1),
  ('cat-buying', 'buying-guide', 'Panduan Beli', 'Buying Guide', 'cat-guides', '🛍️', 2),
  ('cat-comparison', 'comparison', 'Perbandingan', 'Comparison', 'cat-guides', '⚖️', 3);
