import type { APIRoute } from 'astro';

interface CallbackPayload {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: string;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: string;
  paid_at: number;
  note: string;
}

async function verifySignature(privateKey: string, jsonPayload: string, receivedSignature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonPayload);
  const key = encoder.encode(privateKey);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const calculatedSignature = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return calculatedSignature === receivedSignature;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const { TRIPAY_PRIVATE_KEY, DB } = env;

  if (!TRIPAY_PRIVATE_KEY) {
    return new Response(JSON.stringify({ success: false }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rawBody = await request.text();
    const receivedSignature = request.headers.get('X-Callback-Signature') || '';
    
    // Verify signature
    const isValid = await verifySignature(TRIPAY_PRIVATE_KEY, rawBody, receivedSignature);
    
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload: CallbackPayload = JSON.parse(rawBody);
    const { merchant_ref, status, paid_at, reference } = payload;

    if (DB) {
      // 1. Fetch existing order to check status & get items
      const order = await DB.prepare('SELECT * FROM orders WHERE merchant_ref = ?').bind(merchant_ref).first();
      
      if (!order) {
        return new Response(JSON.stringify({ success: false, message: "Order not found" }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // If already PAID, ignore to prevent duplicates
      if (order.payment_status === 'PAID' && status === 'PAID') {
         return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. If status is PAID, generate digital delivery tokens
      if (status === 'PAID') {
        const orderItems = JSON.parse(order.order_items as string || '[]');
        
        for (const item of orderItems) {
          // Generate tokens
          const libraryToken = crypto.randomUUID();
          const downloadToken = crypto.randomUUID();
          const transactionId = crypto.randomUUID();
          
          // Insert into transactions (Digital Entitlement)
          await DB.prepare(`
            INSERT INTO transactions (
              id, product_id, product_name, merchant_ref, amount, status, 
              payment_method, reference, customer_name, customer_email,
              library_token, download_token, download_expires, max_downloads,
              paid_at
            ) VALUES (
              ?, ?, ?, ?, ?, 'paid',
              ?, ?, ?, ?,
              ?, ?, datetime('now', '+7 days'), ?,
              datetime(?, 'unixepoch')
            )
          `).bind(
            transactionId,
            item.sku || item.id || 'unknown', // Fallback
            item.name,
            merchant_ref,
            item.price,
            order.payment_method,
            reference,
            order.customer_name,
            order.customer_email,
            libraryToken,
            downloadToken,
            5, // Max downloads default
            paid_at
          ).run();
        }

        // Update Order Status
        await DB.prepare(`
          UPDATE orders 
          SET payment_status = ?, tripay_reference = ?, paid_at = datetime(?, 'unixepoch')
          WHERE merchant_ref = ?
        `).bind(status, reference, paid_at, merchant_ref).run();

      } else {
        // Just update status (PENDING/FAILED/EXPIRED)
        await DB.prepare(`
          UPDATE orders 
          SET payment_status = ?
          WHERE merchant_ref = ?
        `).bind(status, merchant_ref).run();
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Callback error:', error);
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
