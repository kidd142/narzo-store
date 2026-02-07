
// functions/api/checkout.ts
import { createTransaction } from '../../src/lib/tripay';

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  
  const productId = form.get('product_id');
  const name = form.get('name');
  const email = form.get('email');
  const method = form.get('method');
  
  // Get product
  const product = await env.DB.prepare(
    'SELECT * FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }
  
  // Create transaction record
  const txId = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO transactions (id, product_id, product_name, amount, customer_name, customer_email, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(txId, productId, product.name_id, product.price, name, email, method).run();
  
  // Create Tripay transaction
  const siteUrl = env.SITE_URL || 'https://narzo.store';
  const result = await createTransaction(env, {
    method,
    merchantRef: txId,
    amount: product.price,
    customerName: name,
    customerEmail: email,
    orderItems: [{
      name: product.name_id,
      price: product.price,
      quantity: 1
    }],
    callbackUrl: `${siteUrl}/api/webhooks/tripay`,
    returnUrl: `${siteUrl}/checkout/success?id=${txId}`
  });
  
  if (!result.success) {
    return new Response(JSON.stringify(result), { status: 400 });
  }
  
  // Update with reference
  await env.DB.prepare(
    'UPDATE transactions SET reference = ? WHERE id = ?'
  ).bind(result.data.reference, txId).run();
  
  // Redirect to payment
  return Response.redirect(result.data.checkout_url);
}
