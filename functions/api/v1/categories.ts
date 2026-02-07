// Categories API - Hierarchical categories support
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const parentOnly = url.searchParams.get('parents') === 'true';
    const parentId = url.searchParams.get('parent');
    
    let query = 'SELECT * FROM categories';
    let params: any[] = [];
    
    if (parentOnly) {
      query += ' WHERE parent_id IS NULL';
    } else if (parentId) {
      query += ' WHERE parent_id = ?';
      params.push(parentId);
    }
    
    query += ' ORDER BY sort_order ASC';
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    // Build hierarchical structure if no filter
    let categories = result.results;
    
    if (!parentOnly && !parentId) {
      // Group children under parents
      const parents = categories.filter((c: any) => !c.parent_id);
      const children = categories.filter((c: any) => c.parent_id);
      
      categories = parents.map((parent: any) => ({
        ...parent,
        children: children.filter((c: any) => c.parent_id === parent.id)
      }));
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: result.results.length,
      categories
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

// POST - Create/update category
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    if (!data.slug || !data.name_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: slug, name_id' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = data.id || `cat-${data.slug}`;
    
    await env.DB.prepare(`
      INSERT INTO categories (id, slug, name_id, name_en, parent_id, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name_id = excluded.name_id,
        name_en = excluded.name_en,
        parent_id = excluded.parent_id,
        icon = excluded.icon,
        sort_order = excluded.sort_order
    `).bind(
      id,
      data.slug,
      data.name_id,
      data.name_en || null,
      data.parent_id || null,
      data.icon || null,
      data.sort_order || 0
    ).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      id,
      slug: data.slug
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

// DELETE - Delete category
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
      await env.DB.prepare('DELETE FROM categories WHERE slug = ?').bind(slug).run();
    } else {
      await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
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
