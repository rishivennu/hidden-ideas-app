/**
 * The Supabase host is derived from NEXT_PUBLIC_SUPABASE_URL so that swapping
 * projects does not silently break images and video: next/image rejects hosts
 * missing from remotePatterns, and the CSP below blocks any other media origin.
 */
const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  } catch {
    return 'mvtcccmqdcvchbxsszay.supabase.co'
  }
})()

const SUPABASE_ORIGIN = `https://${SUPABASE_HOST}`

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: ${SUPABASE_ORIGIN}`,
              `media-src 'self' blob: ${SUPABASE_ORIGIN}`,
              `connect-src 'self' ${SUPABASE_ORIGIN} wss://${SUPABASE_HOST}`,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
