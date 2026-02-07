
// functions/api/download/[token].ts
export async function onRequestGet({ params, env, request }) {
  const { token } = params;
  
  // Find transaction by download token
  const tx = await env.DB.prepare(`
    SELECT t.*, p.download_url, p.name_id 
    FROM transactions t 
    JOIN products p ON t.product_id = p.id
    WHERE t.download_token = ? AND t.status = 'paid'
  `).bind(token).first();
  
  if (!tx) {
    return new Response('Invalid or expired download link', { status: 404 });
  }
  
  // Check expiry
  if (new Date(tx.download_expires) < new Date()) {
    return new Response('Download link has expired', { status: 410 });
  }
  
  // Check download limit
  if (tx.downloads_used >= tx.max_downloads) {
    return new Response('Download limit reached', { status: 429 });
  }
  
  // Log download
  const ip = request.headers.get('CF-Connecting-IP');
  const ua = request.headers.get('User-Agent');
  await env.DB.prepare(`
    INSERT INTO downloads (transaction_id, product_id, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
  `).bind(tx.id, tx.product_id, ip, ua).run();
  
  // Increment download count
  await env.DB.prepare(`
    UPDATE transactions SET downloads_used = downloads_used + 1 WHERE id = ?
  `).bind(tx.id).run();
  
  // Redirect to actual download (R2 or external)
  return Response.redirect(tx.download_url, 302);
}
