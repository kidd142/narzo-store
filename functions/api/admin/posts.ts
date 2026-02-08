// functions/api/admin/posts.ts
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  
  const data = {
    id: form.get('id'),
    slug: form.get('slug'),
    title_id: form.get('title_id'),
    title_en: form.get('title_en') || null,
    excerpt_id: form.get('excerpt_id') || null,
    excerpt_en: form.get('excerpt_en') || null,
    content_id: form.get('content_id') || null,
    content_en: form.get('content_en') || null,
    cover_image: form.get('cover_image') || null,
    category: form.get('category') || null,
    tags: form.get('tags') || null,
    published: form.get('published') ? 1 : 0,
    featured: form.get('featured') ? 1 : 0,
    enable_ads: form.get('enable_ads') ? 1 : 0,
  };
  
  // Upsert with all fields
  await env.DB.prepare(`
    INSERT INTO posts (id, slug, title_id, title_en, excerpt_id, excerpt_en, 
                      content_id, content_en, cover_image, category, tags, 
                      published, featured, enable_ads)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
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
    data.id, data.slug, data.title_id, data.title_en,
    data.excerpt_id, data.excerpt_en, data.content_id, data.content_en,
    data.cover_image, data.category, data.tags,
    data.published, data.featured, data.enable_ads
  ).run();
  
  return Response.redirect(new URL('/admin/posts', request.url));
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true }));
}
