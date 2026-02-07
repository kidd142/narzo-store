// functions/api/admin/products.ts
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  
  const data = {
    id: form.get('id'),
    slug: form.get('slug'),
    name_id: form.get('name_id'),
    name_en: form.get('name_en') || null,
    description_id: form.get('description_id') || null,
    price: parseInt(form.get('price') as string),
    image_url: form.get('image_url') || null,
    is_active: form.get('is_active') ? 1 : 0,
    is_digital: form.get('is_digital') ? 1 : 0,
  };
  
  await env.DB.prepare(`
    INSERT INTO products (id, slug, name_id, name_en, description_id, price, image_url, is_active, is_digital)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name_id = excluded.name_id,
      name_en = excluded.name_en,
      description_id = excluded.description_id,
      price = excluded.price,
      image_url = excluded.image_url,
      is_active = excluded.is_active,
      is_digital = excluded.is_digital
  `).bind(
    data.id, data.slug, data.name_id, data.name_en,
    data.description_id, data.price, data.image_url, data.is_active, data.is_digital
  ).run();
  
  return Response.redirect(new URL('/admin/products', request.url));
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true }));
}