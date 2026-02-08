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

// Sanitize text
function sanitizeText(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/<[^>]*>/g, '').slice(0, 5000);
}

// GET - List products
export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    const activeOnly = url.searchParams.get('active') !== 'false';
    
    const DB = env.DB;
    let result;
    
    if (slug) {
      result = await DB.prepare(
        'SELECT * FROM products WHERE slug = ?'
      ).bind(slug).all();
    } else if (activeOnly) {
      result = await DB.prepare(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC'
      ).all();
    } else {
      result = await DB.prepare(
        'SELECT * FROM products ORDER BY created_at DESC'
      ).all();
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      products: result.results 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST - Create or update product
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const {
      slug,
      name_id,
      name_en,
      description_id,
      description_en,
      price,
      image_url,
      stock = -1,
      is_digital = 0,
      download_url,
      is_active = 1
    } = body;
    
    if (!slug || !name_id || price === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: slug, name_id, price'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const DB = env.DB;
    
    // Check if product exists
    const existing = await DB.prepare(
      'SELECT id FROM products WHERE slug = ?'
    ).bind(slug).first();
    
    if (existing) {
      // Update existing product
      await DB.prepare(`
        UPDATE products SET
          name_id = ?,
          name_en = ?,
          description_id = ?,
          description_en = ?,
          price = ?,
          image_url = ?,
          stock = ?,
          is_digital = ?,
          download_url = ?,
          is_active = ?
        WHERE slug = ?
      `).bind(
        sanitizeText(name_id),
        sanitizeText(name_en) || null,
        sanitizeText(description_id) || null,
        sanitizeText(description_en) || null,
        price,
        image_url || null,
        stock,
        is_digital ? 1 : 0,
        download_url || null,
        is_active ? 1 : 0,
        slug
      ).run();
      
      return new Response(JSON.stringify({ 
        success: true,
        id: existing.id,
        slug,
        action: 'updated'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Create new product
      const id = crypto.randomUUID();
      
      await DB.prepare(`
        INSERT INTO products (id, slug, name_id, name_en, description_id, description_en, price, image_url, stock, is_digital, download_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        slug,
        sanitizeText(name_id),
        sanitizeText(name_en) || null,
        sanitizeText(description_id) || null,
        sanitizeText(description_en) || null,
        price,
        image_url || null,
        stock,
        is_digital ? 1 : 0,
        download_url || null,
        is_active ? 1 : 0
      ).run();
      
      return new Response(JSON.stringify({ 
        success: true,
        id,
        slug,
        action: 'created'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - Delete product
export const DELETE: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { slug } = body;
    
    if (!slug) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: slug'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const DB = env.DB;
    
    await DB.prepare(
      'DELETE FROM products WHERE slug = ?'
    ).bind(slug).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      slug,
      action: 'deleted'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
