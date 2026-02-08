// API Key Authentication Middleware
export async function onRequest({ request, env, next }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey || apiKey !== env.API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized',
      message: 'Missing or invalid API key'
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Simple rate limiting with KV
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;
  const count = parseInt(await env.SESSIONS.get(key) || '0');
  
  if (count > 100) { // 100 requests per minute
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  await env.SESSIONS.put(key, String(count + 1), { expirationTtl: 60 });
  
  return next();
}
