interface Env {
  TRIPAY_API_KEY: string;
  TRIPAY_MODE: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { TRIPAY_API_KEY, TRIPAY_MODE } = context.env;
  const url = new URL(context.request.url);
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return new Response(JSON.stringify({ success: false, message: "Missing reference" }), { status: 400 });
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
  }
}
