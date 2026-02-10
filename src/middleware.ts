// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

// Security headers (CSP removed to allow third-party ad scripts)
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Get locale from cookie
function getLocaleFromCookie(request: Request): string {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/locale=([^;]+)/);
  return match ? match[1] : 'id';
}

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  const url = new URL(request.url);
  
  // Set locale in locals for all pages to access
  (locals as any).locale = getLocaleFromCookie(request);
  
  // Only protect /admin routes (except login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const cookies = request.headers.get('cookie') || '';
    const match = cookies.match(/session=([^;]+)/);
    
    if (!match) return redirect('/admin/login');
    
    const session = await locals.runtime.env.SESSIONS.get(`session:${match[1]}`);
    if (!session) return redirect('/admin/login');
  }
  
  const response = await next();
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
});