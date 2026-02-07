// functions/api/auth/logout.ts
export async function onRequestPost({ request, env }) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/session=([^;]+)/);
  
  if (match) {
    await env.SESSIONS.delete(`session:${match[1]}`);
  }
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0'
    }
  });
}