import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type CookieToSet = {
  name: string;
  value: string;
  options: any;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin));
  }

  const response = NextResponse.redirect(new URL('/dashboard', url.origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (request.headers.get('cookie') ?? '')
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const separator = cookie.indexOf('=');
              return {
                name: cookie.slice(0, separator),
                value: cookie.slice(separator + 1),
              };
            });
        },
        setAll(cookies: CookieToSet[]) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
