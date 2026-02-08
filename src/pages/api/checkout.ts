// src/pages/api/checkout.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = locals.runtime.env;
  const DB = env.DB;
  
  // Get form data
  const formData = await request.formData();
  const product_id = formData.get('product_id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const method = formData.get('method') as string;
  
  if (!product_id || !name || !email || !method) {
    return new Response('Missing required fields', { status: 400 });
  }
  
  // Get product
  const product = await DB.prepare(
    'SELECT * FROM products WHERE id = ? AND is_active = 1'
  ).bind(product_id).first();
  
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }
  
  // Generate merchant ref
  const merchantRef = `NRZ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Create order in database first
  const orderId = crypto.randomUUID();
  await DB.prepare(`
    INSERT INTO orders (id, merchant_ref, customer_name, customer_email, amount, payment_method, payment_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', datetime('now'))
  `).bind(orderId, merchantRef, name, email, product.price, method).run();
  
  // Create Tripay transaction
  const TRIPAY_API_KEY = env.TRIPAY_API_KEY;
  const TRIPAY_PRIVATE_KEY = env.TRIPAY_PRIVATE_KEY;
  const TRIPAY_MERCHANT_CODE = env.TRIPAY_MERCHANT_CODE;
  const TRIPAY_MODE = env.TRIPAY_MODE || 'sandbox';
  
  const baseUrl = TRIPAY_MODE === 'production' 
    ? 'https://tripay.co.id/api' 
    : 'https://tripay.co.id/api-sandbox';
  
  // Generate signature
  const signature = await generateSignature(
    TRIPAY_MERCHANT_CODE,
    merchantRef,
    product.price,
    TRIPAY_PRIVATE_KEY
  );
  
  const payload = {
    method: method,
    merchant_ref: merchantRef,
    amount: product.price,
    customer_name: name,
    customer_email: email,
    order_items: [
      {
        sku: product.id,
        name: product.name_id || product.name_en,
        price: product.price,
        quantity: 1,
      }
    ],
    callback_url: 'https://narzo.store/api/tripay/callback',
    return_url: `https://narzo.store/payment/success?ref=${merchantRef}`,
    expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    signature: signature,
  };
  
  try {
    const response = await fetch(`${baseUrl}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Tripay error:', result);
      return new Response(`Payment error: ${result.message}`, { status: 500 });
    }
    
    // Update order with Tripay reference
    await DB.prepare(`
      UPDATE orders SET tripay_reference = ?, checkout_url = ? WHERE id = ?
    `).bind(result.data.reference, result.data.checkout_url, orderId).run();
    
    // Redirect to Tripay checkout
    return redirect(result.data.checkout_url);
    
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(`Checkout error: ${error.message}`, { status: 500 });
  }
};

async function generateSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): Promise<string> {
  const data = merchantCode + merchantRef + amount;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(privateKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
