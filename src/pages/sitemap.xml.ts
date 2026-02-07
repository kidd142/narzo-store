import type { APIContext } from 'astro';

interface Post {
  slug: string;
  updated_at?: string;
  created_at: string;
}

interface Product {
  slug: string;
  updated_at?: string;
  created_at: string;
}

interface Category {
  slug: string;
}

export async function GET(context: APIContext) {
  const baseUrl = 'https://narzo.store';
  const db = context.locals?.runtime?.env?.DB;

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/search', priority: '0.5', changefreq: 'weekly' },
  ];

  let posts: Post[] = [];
  let products: Product[] = [];
  let categories: Category[] = [];

  if (db) {
    try {
      // Posts
      const postsResult: any = await db.prepare(
        'SELECT slug, updated_at, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
      ).all();
      posts = (postsResult.results || []) as Post[];

      // Products (Fix: active -> is_active)
      const productsResult: any = await db.prepare(
        'SELECT slug, created_at FROM products WHERE is_active = 1 ORDER BY created_at DESC'
      ).all();
      products = (productsResult.results || []) as Product[];

      // Categories
      const categoriesResult: any = await db.prepare(
        'SELECT slug FROM categories ORDER BY sort_order ASC'
      ).all();
      categories = (categoriesResult.results || []) as Category[];

    } catch (e) {
      console.error("Failed to fetch content for sitemap", e);
    }
  } else {
    // Fallback Mock Data if DB is not available
    posts = [
      { slug: 'hello-world', created_at: new Date().toISOString() }
    ];
    products = [
      { slug: 'mobile-legends', created_at: new Date().toISOString() }
    ];
    categories = [
      { slug: 'games' },
      { slug: 'vouchers' }
    ];
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${categories.map(cat => `  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${posts.map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at || post.created_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${products.map(product => `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updated_at || product.created_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
