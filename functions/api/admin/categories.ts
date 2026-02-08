// functions/api/admin/categories.ts
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  
  const data = {
    id: form.get('id'),
    slug: form.get('slug'),
    name_id: form.get('name_id'),
    name_en: form.get('name_en') || null,
    sort_order: parseInt(form.get('sort_order') as string) || 0,
  };
  
  await env.DB.prepare(`
    INSERT INTO categories (id, slug, name_id, name_en, sort_order)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name_id = excluded.name_id,
      name_en = excluded.name_en,
      sort_order = excluded.sort_order
  `).bind(data.id, data.slug, data.name_id, data.name_en, data.sort_order).run();
  
  return Response.redirect(new URL('/admin/categories', request.url));
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true }));
}
