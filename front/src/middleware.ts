import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/home', '/about', '/contact', '/features', '/pricing', '/login', '/register']

// Routes qui nécessitent d'être déconnecté (auth routes)
const authRoutes = ['/login', '/register']

// Routes qui nécessitent d'être connecté (protected routes)
const protectedRoutes = ['/dashboard', '/surveys', '/responses']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Si l'utilisateur est sur une route d'authentification et est connecté
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuration des routes sur lesquelles le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 