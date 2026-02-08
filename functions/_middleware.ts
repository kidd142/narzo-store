export const onRequest = async (context: any) => {
  const response = await context.next();
  const url = new URL(context.request.url);

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://cdn.quilljs.com https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.quilljs.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://pagead2.googlesyndication.com https://cloudflareinsights.com; " +
    "frame-ancestors 'none';"
  );

  // Cache static assets (if they pass through here)
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } 
  // Cache HTML pages for a short time
  else if (response.headers.get('Content-Type')?.includes('text/html')) {
    // 1 minute browser cache, 10 minutes stale-while-revalidate
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
  }

  return response;
};
