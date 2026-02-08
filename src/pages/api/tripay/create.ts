import type { APIRoute } from 'astro';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface CreateTransactionRequest {
  method: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_items: OrderItem[];
}

async function generateSignature(privateKey: string, merchantCode: string, merchantRef: string, amount: number): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(merchantCode + merchantRef + amount);
  const key = encoder.encode(privateKey);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateMerchantRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NRZ-${timestamp}-${random}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const { TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, TRIPAY_MERCHANT_CODE, TRIPAY_MODE, DB } = env;

  if (!TRIPAY_API_KEY || !TRIPAY_PRIVATE_KEY || !TRIPAY_MERCHANT_CODE) {
    return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: CreateTransactionRequest = await request.json();
    const { method, amount, customer_name, customer_email, customer_phone, order_items } = body;

    if (!method || !amount || !customer_name || !customer_email) {
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const merchantRef = generateMerchantRef();
    const signature = await generateSignature(TRIPAY_PRIVATE_KEY, TRIPAY_MERCHANT_CODE, merchantRef, amount);
    
    const baseUrl = TRIPAY_MODE === 'production' 
      ? 'https://tripay.co.id/api' 
      : 'https://tripay.co.id/api-sandbox';

    const tripayPayload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      order_items: order_items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      callback_url: 'https://narzo.store/api/tripay/callback',
      return_url: 'https://narzo.store/payment/success',
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      signature
    };

    const response = await fetch(`${baseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tripayPayload)
    });

    const data = await response.json();

    if (data.success && DB) {
      const orderId = crypto.randomUUID();
      await DB.prepare(`
        INSERT INTO orders (id, merchant_ref, customer_name, customer_email, customer_phone, amount, payment_method, payment_status, tripay_reference, order_items)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?)
      `).bind(
        orderId,
        merchantRef,
        customer_name,
        customer_email,
        customer_phone || '',
        amount,
        method,
        data.data?.reference || null,
        JSON.stringify(order_items)
      ).run();
    }

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

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
