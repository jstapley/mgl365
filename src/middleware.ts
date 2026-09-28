import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_HOST = 'admin.mgl365antigua.com'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const onAdminHost = hostname === ADMIN_HOST || hostname.startsWith('admin.')

  // ── Admin subdomain ──────────────────────────────────────────────────────
  if (onAdminHost) {
    // Let API routes, Next.js internals, and static files (anything with a
    // file extension: manifest, icons, robots.txt, etc.) pass through unchanged
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next') ||
      /\.[a-z0-9]+$/i.test(pathname)   // has a file extension
    ) {
      return NextResponse.next({ request })
    }

    // Map clean browser paths to Next.js /admin/* paths
    const nextPath =
      pathname === '/' ? '/admin'
      : pathname.startsWith('/admin') ? pathname
      : `/admin${pathname}`

    return authGuard(request, nextPath, /* rewrite */ nextPath !== pathname)
  }

  // ── Main host — protect /admin/* ─────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    return authGuard(request, pathname, /* rewrite */ false)
  }

  // ── Public pages — refresh session only ──────────────────────────────────
  return refreshSession(request)
}

/**
 * Refresh the Supabase session, optionally enforce auth, and
 * rewrite the URL to `nextPath` if needed (admin subdomain rewriting).
 */
async function authGuard(
  request: NextRequest,
  nextPath: string,
  rewrite: boolean,
): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = nextPath

  const makeResponse = () =>
    rewrite ? NextResponse.rewrite(rewriteUrl) : NextResponse.next({ request })

  if (!supabaseUrl || !supabaseKey) return makeResponse()

  let response = makeResponse()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    db: { schema: 'mgl-365' },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = makeResponse()
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const isLogin = nextPath === '/admin/login'

  if (!isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return response
}

/** Refresh session cookies for public (non-admin) pages. */
async function refreshSession(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    db: { schema: 'mgl-365' },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
