// functions/api/admin/_middleware.ts
export async function onRequest({ request, env, next }) {
  // Get session cookie
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch?.[1];
  
  if (!sessionId) {
    return Response.redirect(new URL('/admin/login', request.url));
  }
  
  // Verify session in KV
  const session = await env.SESSIONS.get(`session:${sessionId}`);
  if (!session) {
    return Response.redirect(new URL('/admin/login', request.url));
  }
  
  return next();
}
