import type { APIContext } from 'astro';

interface Post {
  slug: string;
  updated_at?: string;
  created_at: string;
}

interface Category {
  slug: string;
}

export async function GET(context: APIContext) {
  const baseUrl = 'https://narzo.site';
  const db = context.locals?.runtime?.env?.DB;

  // Static pages (blog-focused only)
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/search', priority: '0.5', changefreq: 'weekly' },
  ];

  // Active categories (blog-focused only)
  const activeCategories = [
    'tutorials', 'apps', 'how-to', 'gaming', 'entertainment',
    'buying-guide', 'comparison', 'news', 'productivity', 'tech-news',
    'finance', 'social-media', 'security', 'shopping', 'lifestyle'
  ];

  let posts: Post[] = [];
  let categories: Category[] = [];

  if (db) {
    try {
      // Posts
      const postsResult: any = await db.prepare(
        'SELECT slug, updated_at, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
      ).all();
      posts = (postsResult.results || []) as Post[];

      // Categories - only active ones
      const categoriesResult: any = await db.prepare(
        'SELECT slug FROM categories ORDER BY sort_order ASC'
      ).all();
      const allCategories = (categoriesResult.results || []) as Category[];
      categories = allCategories.filter(c => activeCategories.includes(c.slug));

    } catch (e) {
      console.error("Failed to fetch content for sitemap", e);
    }
  }

  // Format datetime to ISO 8601 (W3C format for sitemaps)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    
    // If already ISO format, return as is
    if (dateStr.includes('T') && dateStr.includes('Z')) return dateStr;
    
    // Convert "YYYY-MM-DD HH:MM:SS" to ISO 8601 with timezone
    // Replace space with T, add timezone (+07:00 for Jakarta)
    const isoString = dateStr.replace(' ', 'T');
    
    // If timezone already present, return
    if (isoString.includes('+') || isoString.endsWith('Z')) return isoString;
    
    // Add Jakarta timezone
    return isoString + '+07:00';
  };

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
    <lastmod>${formatDate(post.updated_at || post.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
