import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, locals, redirect }) => {
  const { token } = params;
  const env = locals.runtime.env;
  const DB = env.DB;
  const locale = (locals as any).locale || 'id';

  const t = {
    invalid: locale === 'en' ? 'Invalid Request' : 'Permintaan Tidak Valid',
    expired: locale === 'en' ? 'Invalid or Expired Link' : 'Link Tidak Valid atau Kadaluarsa',
    timeExpired: locale === 'en' ? 'Download Link Expired. Please refresh your library page to get a new link.' : 'Link Download Kadaluarsa. Silakan refresh halaman library untuk mendapatkan link baru.',
    limit: locale === 'en' ? 'Download Limit Reached' : 'Batas Download Tercapai',
    configError: locale === 'en' ? 'File configuration error. Please contact support.' : 'Error konfigurasi file. Silakan hubungi support.',
    serverError: locale === 'en' ? 'Internal Server Error' : 'Terjadi Kesalahan Server'
  };

  if (!token || !DB) {
    return new Response(t.invalid, { status: 400 });
  }

  try {
    // 1. Find Transaction by download_token
    const transaction = await DB.prepare('SELECT * FROM transactions WHERE download_token = ?').bind(token).first();
    
    if (!transaction) {
      return new Response(t.expired, { status: 404 });
    }

    // 2. Check Expiry
    const now = new Date();
    const expires = new Date(transaction.download_expires);
    if (now > expires) {
      return new Response(t.timeExpired, { status: 410 });
    }

    // 3. Check Limit
    if (transaction.downloads_used >= transaction.max_downloads) {
      return new Response(t.limit, { status: 403 });
    }

    // 4. Get Product Download URL
    const product = await DB.prepare('SELECT download_url FROM products WHERE id = ?').bind(transaction.product_id).first();
    
    if (!product || !product.download_url) {
      return new Response(t.configError, { status: 500 });
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
    return new Response(t.serverError, { status: 500 });
  }
};
