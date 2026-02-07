// src/lib/auth.ts

export async function checkAdminSession(Astro: any): Promise<boolean> {
  const cookie = Astro.request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch?.[1];
  
  if (!sessionId) {
    return false;
  }
  
  try {
    const session = await Astro.locals.runtime.env.SESSIONS.get(`session:${sessionId}`);
    return !!session;
  } catch {
    return false;
  }
}

export async function requireAdmin(Astro: any): Promise<Response | null> {
  const isAdmin = await checkAdminSession(Astro);
  if (!isAdmin) {
    return Astro.redirect('/admin/login');
  }
  return null;
}
