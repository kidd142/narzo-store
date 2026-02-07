// functions/api/v1/posts.ts
export async function onRequestPost({ request, env }) {
  const data = await request.json();
  
  // Validate required fields
  if (!data.title_id || !data.slug) {
    return new Response(JSON.stringify({ 
      error: 'Missing required fields: title_id, slug' 
    }), { status: 400 });
  }
  
  const id = data.id || crypto.randomUUID();
  
  await env.DB.prepare(`
    INSERT INTO posts (id, slug, title_id, title_en, excerpt_id, excerpt_en,
                      content_id, content_en, cover_image, category, tags,
                      published, featured, enable_ads)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title_id = excluded.title_id,
      title_en = excluded.title_en,
      content_id = excluded.content_id,
      content_en = excluded.content_en,
      cover_image = excluded.cover_image,
      category = excluded.category,
      tags = excluded.tags,
      published = excluded.published,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id, data.slug, data.title_id, data.title_en || null,
    data.excerpt_id || null, data.excerpt_en || null,
    data.content_id || null, data.content_en || null,
    data.cover_image || null, data.category || null, data.tags || null,
    data.published ? 1 : 0, data.featured ? 1 : 0, data.enable_ads !== false ? 1 : 0
  ).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    id,
    slug: data.slug,
    url: `https://narzo.store/blog/${data.slug}`
  }));
}

// GET - List posts
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  
  const posts = await env.DB.prepare(
    'SELECT id, slug, title_id, category, published, created_at FROM posts ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all();
  
  return new Response(JSON.stringify(posts.results));
}

// DELETE
export async function onRequestDelete({ request, env }) {
  const { slug } = await request.json();
  await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
  return new Response(JSON.stringify({ success: true }));
}