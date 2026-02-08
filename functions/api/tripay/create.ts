import { createHmac } from 'node:crypto';

interface Env {
  TRIPAY_API_KEY: string;
  TRIPAY_PRIVATE_KEY: string;
  TRIPAY_MERCHANT_CODE: string;
  TRIPAY_MODE: string;
  DB: D1Database;
}

interface CreateRequest {
  amount: number;
  method: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: any[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, TRIPAY_MERCHANT_CODE, TRIPAY_MODE, DB } = context.env;

  if (!TRIPAY_API_KEY || !TRIPAY_PRIVATE_KEY || !TRIPAY_MERCHANT_CODE) {
    return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), { status: 500 });
  }

  try {
    const body: CreateRequest = await context.request.json();
    const { amount, method, customer_name, customer_email, customer_phone, order_items } = body;

    // Validate input
    if (!amount || !method || !customer_email || !customer_phone) {
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), { status: 400 });
    }

    const merchantRef = `NRZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const signature = createHmac('sha256', TRIPAY_PRIVATE_KEY)
      .update(TRIPAY_MERCHANT_CODE + merchantRef + amount)
      .digest('hex');

    const baseUrl = TRIPAY_MODE === 'production' 
      ? 'https://tripay.co.id/api' 
      : 'https://tripay.co.id/api-sandbox';

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items,
      callback_url: 'https://narzo.store/api/tripay/callback',
      return_url: `https://narzo.store/checkout/success?ref=${merchantRef}`, // Adjust based on frontend routes
      expired_time: (Math.floor(Date.now() / 1000) + 24 * 60 * 60), // 24 hours expiry
      signature
    };

    const response = await fetch(`${baseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400 });
    }

    // Save to DB
    const data = result.data;
    await DB.prepare(`
      INSERT INTO orders (
        id, merchant_ref, customer_name, customer_email, customer_phone, 
        amount, payment_method, payment_status, tripay_reference, order_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      merchantRef,
      customer_name,
      customer_email,
      customer_phone,
      amount,
      method,
      'UNPAID', // Initial status
      data.reference,
      JSON.stringify(order_items)
    ).run();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
  }
}
