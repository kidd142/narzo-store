export const onRequest = async (context: any) => {
  const response = await context.next();
  const url = new URL(context.request.url);

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
