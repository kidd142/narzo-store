import { createHmac } from 'node:crypto';

interface Env {
  TRIPAY_PRIVATE_KEY: string;
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { TRIPAY_PRIVATE_KEY, DB } = context.env;
  const signature = context.request.headers.get('X-Callback-Signature');

  if (!signature) {
    return new Response(JSON.stringify({ success: false, message: "Missing signature" }), { status: 400 });
  }

  const rawBody = await context.request.text();
  const calculatedSignature = createHmac('sha256', TRIPAY_PRIVATE_KEY)
    .update(rawBody)
    .digest('hex');

  if (signature !== calculatedSignature) {
    return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const { merchant_ref, status, reference } = event;

  // Map Tripay status to our status
  let paymentStatus = 'UNPAID';
  if (status === 'PAID') paymentStatus = 'PAID';
  else if (status === 'EXPIRED') paymentStatus = 'EXPIRED';
  else if (status === 'FAILED') paymentStatus = 'FAILED';

  try {
    const query = `
      UPDATE orders 
      SET payment_status = ?, tripay_reference = ?, paid_at = ?
      WHERE merchant_ref = ?
    `;

    const paidAt = status === 'PAID' ? new Date().toISOString() : null;

    await DB.prepare(query)
      .bind(paymentStatus, reference, paidAt, merchant_ref)
      .run();

    return new Response(JSON.stringify({ success: true }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Database update failed" }), { status: 500 });
  }
}
