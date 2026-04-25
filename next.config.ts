import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'assets-global.website-files.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/agent-training',
        destination: '/switchboard/agent-training',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
