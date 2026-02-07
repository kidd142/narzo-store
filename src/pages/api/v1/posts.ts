import type { APIRoute } from 'astro';

// Auth helper
function checkAuth(request: Request, env: any): Response | null {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || apiKey !== env.API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized',
      message: 'Missing or invalid API key'
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

// Sanitize HTML - remove dangerous tags and attributes
function sanitizeHtml(html: string | null): string | null {
  if (!html) return null;
  return html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove onclick, onerror, onload etc event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs in src (potential XSS)
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object/embed tags
    .replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
}

// Sanitize text - strip all HTML
function sanitizeText(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/<[^>]*>/g, '').slice(0, 500);
}

// GET - List posts
export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const posts = await env.DB.prepare(
      'SELECT id, slug, title_id, title_en, excerpt_id, published, featured, views, created_at, updated_at FROM posts ORDER BY created_at DESC LIMIT ?'
    ).bind(limit).all();
    
    return new Response(JSON.stringify({
      success: true,
      count: posts.results.length,
      posts: posts.results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST - Create/Update post
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const data = await request.json();
    
    if (!data.title_id || !data.slug) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: title_id, slug' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = data.id || crypto.randomUUID();
    
    // Sanitize inputs
    const safeTitle = sanitizeText(data.title_id);
    const safeTitleEn = sanitizeText(data.title_en);
    const safeExcerpt = sanitizeText(data.excerpt_id);
    const safeExcerptEn = sanitizeText(data.excerpt_en);
    const safeContent = sanitizeHtml(data.content_id);
    const safeContentEn = sanitizeHtml(data.content_en);
    
    await env.DB.prepare(`
      INSERT INTO posts (id, slug, title_id, title_en, excerpt_id, excerpt_en,
                        content_id, content_en, cover_image, category, tags,
                        published, featured, enable_ads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title_id = excluded.title_id,
        title_en = excluded.title_en,
        excerpt_id = excluded.excerpt_id,
        excerpt_en = excluded.excerpt_en,
        content_id = excluded.content_id,
        content_en = excluded.content_en,
        cover_image = excluded.cover_image,
        category = excluded.category,
        tags = excluded.tags,
        published = excluded.published,
        featured = excluded.featured,
        enable_ads = excluded.enable_ads,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id, data.slug, safeTitle, safeTitleEn || null,
      safeExcerpt || null, safeExcerptEn || null,
      safeContent || null, safeContentEn || null,
      data.cover_image || null, data.category || null, data.tags || null,
      data.published ? 1 : 0, data.featured ? 1 : 0, data.enable_ads !== false ? 1 : 0
    ).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id,
      slug: data.slug,
      url: `https://narzo.store/blog/${data.slug}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - Delete post
export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const { slug, id } = await request.json();
    
    if (!slug && !id) {
      return new Response(JSON.stringify({ 
        error: 'Missing slug or id' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (slug) {
      await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
    } else {
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
