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

// POST - Upload image
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;
  
  try {
    const form = await request.formData();
    const file = form.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type',
        message: 'Allowed: JPG, PNG, WebP, GIF'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ 
        error: 'File too large',
        message: 'Max size: 5MB'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const path = `uploads/${filename}`;
    
    // Upload to R2
    await env.MEDIA.put(path, file.stream(), {
      httpMetadata: { contentType: file.type }
    });
    
    // Return public URL
    const url = `https://media.narzo.store/${path}`;
    
    return new Response(JSON.stringify({ 
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
