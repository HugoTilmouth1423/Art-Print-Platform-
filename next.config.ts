import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable cacheComponents to allow dynamic server-side data fetching
  // in server components without explicit Suspense boundaries
}

export default nextConfig
