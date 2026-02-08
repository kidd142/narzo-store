import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime.env;
  const { TRIPAY_API_KEY, TRIPAY_MODE } = env;
  
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return new Response(JSON.stringify({ success: false, message: "Missing reference" }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!TRIPAY_API_KEY) {
    return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const baseUrl = TRIPAY_MODE === 'production' 
    ? 'https://tripay.co.id/api' 
    : 'https://tripay.co.id/api-sandbox';

  try {
    const response = await fetch(`${baseUrl}/transaction/detail?reference=${ref}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
