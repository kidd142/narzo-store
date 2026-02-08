interface Env {
  TRIPAY_API_KEY: string;
  TRIPAY_MODE: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { TRIPAY_API_KEY, TRIPAY_MODE } = context.env;

  if (!TRIPAY_API_KEY) {
    return new Response(JSON.stringify({ success: false, message: "Server configuration error: Missing API Key" }), { 
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
        'Access-Control-Allow-Origin': '*' // Allow CORS for frontend
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
