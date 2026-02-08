// src/pages/api/v1/files.ts
import type { APIRoute } from 'astro';

const API_KEY = 'nrz_sk_eac1cdadc9ee922f84a895c8f6c512defacf01e30379c867';

function unauthorized() {
  return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/v1/files - List files
// GET /api/v1/files?key=path/to/file - Get file info
export const GET: APIRoute = async ({ request, locals }) => {
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== API_KEY) return unauthorized();

  const R2 = (locals as any).runtime?.env?.MEDIA;
  if (!R2) {
    return jsonResponse({ success: false, error: 'R2 not configured' }, 500);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (key) {
    // Get specific file info
    const object = await R2.head(key);
    if (!object) {
      return jsonResponse({ success: false, error: 'File not found' }, 404);
    }
    return jsonResponse({
      success: true,
      file: {
        key: object.key,
        size: object.size,
        etag: object.etag,
        uploaded: object.uploaded,
        httpMetadata: object.httpMetadata,
      }
    });
  }

  // List all files
  const list = await R2.list({ limit: 100 });
  const files = list.objects.map((obj: any) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
  }));

  return jsonResponse({ success: true, files, truncated: list.truncated });
};

// POST /api/v1/files - Upload file
// Body: multipart/form-data with 'file' field
// Optional query: ?key=custom/path/filename.pdf
export const POST: APIRoute = async ({ request, locals }) => {
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== API_KEY) return unauthorized();

  const R2 = (locals as any).runtime?.env?.MEDIA;
  if (!R2) {
    return jsonResponse({ success: false, error: 'R2 not configured' }, 500);
  }

  try {
    const url = new URL(request.url);
    const contentType = request.headers.get('Content-Type') || '';

    let key: string;
    let body: ArrayBuffer;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle form upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return jsonResponse({ success: false, error: 'No file provided' }, 400);
      }

      key = url.searchParams.get('key') || `uploads/${Date.now()}-${file.name}`;
      body = await file.arrayBuffer();
      mimeType = file.type || 'application/octet-stream';
    } else {
      // Handle raw binary upload
      key = url.searchParams.get('key');
      if (!key) {
        return jsonResponse({ success: false, error: 'Key required for raw upload' }, 400);
      }
      body = await request.arrayBuffer();
      mimeType = contentType || 'application/octet-stream';
    }

    // Upload to R2
    await R2.put(key, body, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    // Generate public URL
    const publicUrl = `https://media.narzo.store/${key}`;

    return jsonResponse({
      success: true,
      key,
      size: body.byteLength,
      contentType: mimeType,
      url: publicUrl,
    });
  } catch (error: any) {
    return jsonResponse({ success: false, error: error.message }, 500);
  }
};

// DELETE /api/v1/files?key=path/to/file
export const DELETE: APIRoute = async ({ request, locals }) => {
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== API_KEY) return unauthorized();

  const R2 = (locals as any).runtime?.env?.MEDIA;
  if (!R2) {
    return jsonResponse({ success: false, error: 'R2 not configured' }, 500);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return jsonResponse({ success: false, error: 'Key required' }, 400);
  }

  await R2.delete(key);
  return jsonResponse({ success: true, deleted: key });
};
