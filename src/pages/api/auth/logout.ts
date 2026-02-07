// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const env = locals.runtime.env;
  const sessionId = cookies.get('session')?.value;
  
  if (sessionId) {
    await env.SESSIONS.delete(`session:${sessionId}`);
  }
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  });
};

export const GET: APIRoute = async (context) => {
  return POST(context);
};
