import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/startup/(.*)', // Allow startup routes but handle community creation separately
  '/user/(.*)',
  '/api/startups(.*)',
  '/api/auth/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/studio(.*)', // Sanity Studio
])

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/startup/create(.*)',
  '/community(.*)',
  '/api/communities(.*)',
  '/api/events(.*)',
  '/api/resources(.*)',
  '/api/profile(.*)',
  '/api/investment-interests(.*)',
  '/api/connection-requests(.*)',
  '/api/messages(.*)',
  '/api/pitches(.*)',
])

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/analytics(.*)',
  '/api/analytics(.*)',
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Protect admin routes - require admin role
  if (isAdminRoute(req)) {
    await auth.protect({ role: 'admin' })
  }

  // Special handling for community creation routes
  if (pathname.includes('/startup/') && pathname.includes('/community')) {
    await auth.protect()
    return
  }

  // Protect general authenticated routes
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
