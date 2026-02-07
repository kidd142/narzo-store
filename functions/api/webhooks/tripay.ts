// functions/api/webhooks/tripay.ts
import { nanoid } from 'nanoid';
import crypto from 'node:crypto';
import { Resend } from 'resend';

function verifyCallback(json: any, privateKey: string): boolean {
  const signature = crypto
    .createHmac('sha256', privateKey)
    .update(JSON.stringify(json))
    .digest('hex');
  return signature === json.signature;
}

async function sendOrderEmail(env: any, data: {
  to: string;
  customerName: string;
  productName: string;
  amount: number;
  reference: string;
  downloadUrl?: string;
}) {
  if (!env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email');
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'Narzo Store <noreply@narzo.store>',
    to: data.to,
    subject: `Order Confirmed - ${data.reference}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Thank you for your order!</h1>
        
        <p>Hi ${data.customerName},</p>
        <p>Your payment has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order:</strong> ${data.reference}</p>
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Amount:</strong> Rp ${data.amount.toLocaleString()}</p>
        </div>
        
        ${data.downloadUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.downloadUrl}" 
               style="background: #6366f1; color: white; padding: 12px 24px; 
                      border-radius: 8px; text-decoration: none;">
              Download Your Product
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This download link is valid for 7 days and can be used 3 times.
          </p>
        ` : ''}
        
        <p>Check your order status anytime: 
          <a href="https://narzo.store/order/${data.reference}">View Order</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Narzo Store • https://narzo.store
        </p>
      </div>
    `
  });
}

export async function onRequestPost({ request, env }) {
  const json = await request.json();
  
  // Verify signature
  if (!verifyCallback(json, env.TRIPAY_PRIVATE_KEY)) {
    return new Response('Invalid signature', { status: 403 });
  }
  
  const { merchant_ref, status } = json;
  
  // Find transaction
  const tx = await env.DB.prepare(
    'SELECT * FROM transactions WHERE id = ?'
  ).bind(merchant_ref).first();

  if (!tx) {
    return new Response('Transaction not found', { status: 404 });
  }

  if (status === 'PAID') {
    // Generate secure download token
    const downloadToken = nanoid(32);
    const downloadExpires = new Date();
    downloadExpires.setDate(downloadExpires.getDate() + 7); // 7 days

    await env.DB.prepare(`
      UPDATE transactions 
      SET status = 'paid', paid_at = CURRENT_TIMESTAMP, download_token = ?, download_expires = ?
      WHERE id = ?
    `).bind(downloadToken, downloadExpires.toISOString(), merchant_ref).run();
    
    // Check if product is digital
    const product = await env.DB.prepare(
      'SELECT is_digital FROM products WHERE id = ?'
    ).bind(tx.product_id).first();
    
    const downloadUrl = product?.is_digital 
      ? `https://narzo.store/api/download/${downloadToken}` 
      : undefined;

    await sendOrderEmail(env, {
      to: tx.customer_email,
      customerName: tx.customer_name,
      productName: tx.product_name,
      amount: tx.amount,
      reference: tx.reference || merchant_ref,
      downloadUrl
    });

  } else if (status === 'EXPIRED') {
    await env.DB.prepare(
      'UPDATE transactions SET status = ? WHERE id = ?'
    ).bind('expired', merchant_ref).run();
  }
  
  return new Response(JSON.stringify({ success: true }));
}
