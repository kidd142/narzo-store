// Upload API - Image upload to R2
export async function onRequestPost({ request, env }) {
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type',
        message: 'Allowed: JPG, PNG, WebP, GIF, PDF'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ 
        error: 'File too large',
        message: 'Max size: 20MB'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate unique filename
    const ext = file.name.split('.').pop();
    let path = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    
    // Special handling for the ebook fix
    if (file.name === 'digital-marketing-guide-2026.pdf') {
      path = 'ebooks/digital-marketing-guide-2026.pdf';
    }
    
    // Upload to R2
    await env.MEDIA.put(path, file.stream(), {
      httpMetadata: { contentType: file.type }
    });
    
    // Return public URL
    const url = `https://media.narzo.site/${path}`;
    
    return new Response(JSON.stringify({ 
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
