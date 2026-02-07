// functions/api/admin/upload.ts
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const file = form.get('file') as File;
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400 });
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), { status: 400 });
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
  // Or use R2 public URL: https://<bucket>.r2.cloudflarestorage.com/${path}
  
  return new Response(JSON.stringify({ 
    success: true, 
    url,
    filename 
  }));
}