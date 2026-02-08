import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const TRIPAY_API_KEY = env.TRIPAY_API_KEY;
  const TRIPAY_MODE = env.TRIPAY_MODE || 'sandbox';

  if (!TRIPAY_API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Server configuration error: Missing API Key" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const baseUrl = TRIPAY_MODE === 'production' 
    ? 'https://tripay.co.id/api' 
    : 'https://tripay.co.id/api-sandbox';

  try {
    const response = await fetch(`${baseUrl}/merchant/payment-channel`, {
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
    return new Response(JSON.stringify({ 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
