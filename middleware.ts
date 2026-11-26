import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/banned') return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return response;
  const adminDb = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: ban } = await adminDb.from('bans').select('id,expires_at').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (ban && (!ban.expires_at || new Date(ban.expires_at).getTime() > Date.now())) {
    const banned = NextResponse.redirect(new URL('/banned', request.url));
    response.cookies.getAll().forEach(cookie => banned.cookies.set(cookie));
    return banned;
  }
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/admin/bans).*)'] };
