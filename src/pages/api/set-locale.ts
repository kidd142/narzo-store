import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { locale } = await request.json();
  
  if (!['id', 'en'].includes(locale)) {
    return new Response(JSON.stringify({ error: 'Invalid locale' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ success: true, locale }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Strict`
    }
  });
};
