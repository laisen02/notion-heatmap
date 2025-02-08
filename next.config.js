/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google Auth profile images
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'notionheatmap.com']
    }
  },
  headers: async () => {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.notion.com https://notion.so;",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://*.notion.com',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
} 