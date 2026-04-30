import { NextResponse, type NextRequest } from 'next/server'

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || ''
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || ''

export function proxy(request: NextRequest) {
  // --- 1. Basic Auth Logic (Vercel環境のみ) ---
  const isVercel = process.env.VERCEL === '1'
  
  if (isVercel) {
    const basicAuth = request.headers.get('authorization')
    let isAuthenticated = false

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user === BASIC_AUTH_USER && pwd === BASIC_AUTH_PASSWORD) {
        isAuthenticated = true
      }
    }

    if (!isAuthenticated) {
      return new NextResponse('Auth Required.', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  // --- 2. Route Protection Logic ---
  const token = request.cookies.get('pathieve_token')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  if (pathname.startsWith('/pathmap') || pathname.startsWith('/wizard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/pathmap', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Basic認証ですべてのルートを保護しつつ、ルート保護ロジックも適用するため
  // 静的ファイル（_next系やfaviconなど）を除外したすべてのリクエストにマッチさせます。
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
