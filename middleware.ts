import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
  matcher: ['/pathmap/:path*', '/wizard/:path*', '/login', '/register'],
}
