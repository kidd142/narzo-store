// functions/api/auth/login.ts
export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const password = formData.get('password');
  
  if (password !== env.ADMIN_PASSWORD) {
    return Response.redirect(new URL('/admin/login?error=1', request.url));
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
}