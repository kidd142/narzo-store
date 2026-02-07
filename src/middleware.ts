// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  const url = new URL(request.url);
  
  // Only protect /admin routes (except login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const cookies = request.headers.get('cookie') || '';
    const match = cookies.match(/session=([^;]+)/);
    
    if (!match) return redirect('/admin/login');
    
    const session = await locals.runtime.env.SESSIONS.get(`session:${match[1]}`);
    if (!session) return redirect('/admin/login');
  }
  
  return next();
});