// functions/api/v1/upload.ts
export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const file = form.get('file') as File;
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
  }
  
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = `uploads/${filename}`;
  
  await env.MEDIA.put(path, file.stream(), {
    httpMetadata: { contentType: file.type }
  });
  
  return new Response(JSON.stringify({ 
    success: true,
    url: `https://media.narzo.store/${path}`,
    filename
  }));
}