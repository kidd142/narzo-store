// Posts API - CRUD operations
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title_id || !data.slug) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: title_id, slug' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET - List posts
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const published = url.searchParams.get('published');
    
    let query = 'SELECT id, slug, title_id, title_en, excerpt_id, category, tags, published, featured, views, created_at, updated_at FROM posts';
    
    if (published !== null) {
      query += ` WHERE published = ${published === 'true' ? 1 : 0}`;
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    
    const posts = await env.DB.prepare(query).bind(limit).all();
    
    return new Response(JSON.stringify({
      success: true,
      count: posts.results.length,
      posts: posts.results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE - Delete post by slug
export async function onRequestDelete({ request, env }) {
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
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
