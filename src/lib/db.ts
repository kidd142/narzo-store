import type { D1Database } from '@cloudflare/workers-types';

export interface Post {
  id: string;
  slug: string;
  title_id: string;
  title_en: string | null;
  excerpt_id: string | null;
  excerpt_en: string | null;
  content_id: string | null;
  content_en: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string | null;
  featured: number;
  published: number;
  enable_ads: number;
  views: number;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name_id: string;
  name_en: string | null;
  description_id: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  is_digital: number;
  is_active: number;
}

export async function getPosts(db: D1Database | null, options: {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
} = {}) {
  if (!db) {
    console.warn('No database connection');
    return [];
  }

  const { limit = 10, offset = 0, category, featured } = options;
  
  let query = 'SELECT * FROM posts WHERE published = 1';
  const params: any[] = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured) {
    query += ' AND featured = 1';
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit);
  params.push(offset);
  
  const result = await db.prepare(query).bind(...params).all<Post>();
  return result.results;
}

export async function getPostsCount(db: D1Database | null, options: {
  category?: string;
} = {}) {
  if (!db) {
    console.warn('No database connection');
    return 0;
  }

  const { category } = options;
  
  let query = 'SELECT COUNT(*) as count FROM posts WHERE published = 1';
  const params: any[] = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  const result = await db.prepare(query).bind(...params).first<{ count: number }>();
  return result?.count || 0;
}

export async function getPostBySlug(db: D1Database | null, slug: string) {
  if (!db) {
    console.warn('No database connection');
    return null;
  }

  return await db.prepare(
    'SELECT * FROM posts WHERE slug = ? AND published = 1'
  ).bind(slug).first<Post>();
}

export async function getProducts(db: D1Database | null, limit = 10) {
  if (!db) {
    console.warn('No database connection');
    return [];
  }

  const result = await db.prepare(
    'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all<Product>();
  return result.results;
}

export async function getProductBySlug(db: D1Database | null, slug: string) {
  if (!db) {
    console.warn('No database connection');
    return null;
  }
  
  return await db.prepare(
    'SELECT * FROM products WHERE slug = ? AND is_active = 1'
  ).bind(slug).first<Product>();
}

export async function incrementViews(db: D1Database | null, postId: string) {
  if (!db) {
    console.warn('No database connection');
    return;
  }

  await db.prepare(
    'UPDATE posts SET views = views + 1 WHERE id = ?'
  ).bind(postId).run();
}

export async function getRelatedPosts(
  db: D1Database | null, 
  category: string | null, 
  excludeId: string, 
  limit = 3
) {
  if (!db || !category) {
    return [];
  }

  const result = await db.prepare(`
    SELECT * FROM posts 
    WHERE category = ? 
      AND id != ? 
      AND published = 1 
    ORDER BY created_at DESC 
    LIMIT ?
  `).bind(category, excludeId, limit).all<Post>();
  
  return result.results || [];
}

// Category types
export interface Category {
  id: string;
  slug: string;
  name_id: string;
  name_en: string | null;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  children?: Category[];
}

// Get all categories with hierarchy
export async function getCategories(db: D1Database | null, options: {
  parentOnly?: boolean;
  parentId?: string;
  hierarchical?: boolean;
} = {}) {
  if (!db) {
    console.warn('No database connection');
    return [];
  }

  const { parentOnly, parentId, hierarchical = true } = options;
  
  let query = 'SELECT * FROM categories';
  const params: any[] = [];
  
  if (parentOnly) {
    query += ' WHERE parent_id IS NULL';
  } else if (parentId) {
    query += ' WHERE parent_id = ?';
    params.push(parentId);
  }
  
  query += ' ORDER BY sort_order ASC';
  
  const result = await db.prepare(query).bind(...params).all<Category>();
  let categories = result.results || [];
  
  // Build hierarchical structure
  if (hierarchical && !parentOnly && !parentId) {
    const parents = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => c.parent_id);
    
    categories = parents.map(parent => ({
      ...parent,
      children: children.filter(c => c.parent_id === parent.id)
    }));
  }
  
  return categories;
}

// Get category by slug
export async function getCategoryBySlug(db: D1Database | null, slug: string) {
  if (!db) {
    console.warn('No database connection');
    return null;
  }

  return await db.prepare(
    'SELECT * FROM categories WHERE slug = ?'
  ).bind(slug).first<Category>();
}

// Get child categories
export async function getChildCategories(db: D1Database | null, parentId: string) {
  if (!db) {
    console.warn('No database connection');
    return [];
  }

  const result = await db.prepare(
    'SELECT * FROM categories WHERE parent_id = ? ORDER BY sort_order ASC'
  ).bind(parentId).all<Category>();
  
  return result.results || [];
}

