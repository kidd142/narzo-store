// src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;
  const formData = await request.formData();
  const password = formData.get('password');
  
  if (password !== env.ADMIN_PASSWORD) {
    return redirect('/admin/login?error=1');
  }
  
  // Create session
  const sessionId = crypto.randomUUID();
  await env.SESSIONS.put(`session:${sessionId}`, 'admin', {
    expirationTtl: 60 * 60 * 24 // 24 hours
  });
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    }
  });
};
