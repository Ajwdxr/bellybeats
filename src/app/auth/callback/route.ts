import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin: internalOrigin } = new URL(request.url);
  
  // Robust origin detection
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const detectedOrigin = host ? `${protocol}://${host}` : internalOrigin;

  // Final site URL (Priority: Env Var > Detected Header > Internal Origin)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || detectedOrigin;
  
  console.log('Auth Callback Debug:', { siteUrl, internalOrigin, host, protocol });

  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/counter';

  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    try {
      // Cast to any to bypass the TypeScript bug in some library versions
      const { error: exchangeError } = await (supabase.auth as any).exchangeCodeForSession(code);
      if (exchangeError) {
        return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(exchangeError.message)}`);
      }
      return NextResponse.redirect(`${siteUrl}${next}`);
    } catch (e: any) {
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('Internal callback error')}`);
    }
  }

  // If no code and no error, redirect with a message
  const params = searchParams.toString();
  return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent('No code received from Google. Params: ' + params)}`);
}
