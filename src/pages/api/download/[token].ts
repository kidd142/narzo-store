import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, locals, redirect }) => {
  const { token } = params;
  const env = locals.runtime.env;
  const DB = env.DB;

  if (!token || !DB) {
    return new Response('Invalid Request', { status: 400 });
  }

  try {
    // 1. Find Transaction by download_token
    const transaction = await DB.prepare('SELECT * FROM transactions WHERE download_token = ?').bind(token).first();
    
    if (!transaction) {
      return new Response('Invalid or Expired Link', { status: 404 });
    }

    // 2. Check Expiry
    const now = new Date();
    const expires = new Date(transaction.download_expires);
    if (now > expires) {
      return new Response('Download Link Expired. Please refresh your library page to get a new link.', { status: 410 });
    }

    // 3. Check Limit
    if (transaction.downloads_used >= transaction.max_downloads) {
      return new Response('Download Limit Reached', { status: 403 });
    }

    // 4. Get Product Download URL
    const product = await DB.prepare('SELECT download_url FROM products WHERE id = ?').bind(transaction.product_id).first();
    
    if (!product || !product.download_url) {
      return new Response('File configuration error. Please contact support.', { status: 500 });
    }

    // 5. Increment Usage
    await DB.prepare('UPDATE transactions SET downloads_used = downloads_used + 1 WHERE id = ?').bind(transaction.id).run();
    
    // 6. Log Download
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const ua = request.headers.get('User-Agent') || 'unknown';
    
    await DB.prepare('INSERT INTO downloads (transaction_id, product_id, ip_address, user_agent) VALUES (?, ?, ?, ?)')
      .bind(transaction.id, transaction.product_id, ip, ua).run();

    // 7. Redirect to actual file
    return redirect(product.download_url, 302);

  } catch (error) {
    console.error('Download error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
