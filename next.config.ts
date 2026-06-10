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
      // Old Webflow blog slugs (duplicate / renamed posts) -> canonical posts.
      {
        source: '/blog/understanding-strange-odors-from-your-ductless-ac-system-in-catskill',
        destination: '/blog/strange-odors-from-ductless-ac-system',
        permanent: true,
      },
      {
        source: '/blog/essential-spring-generator-maintenance-tips-for-your-woodstock-home',
        destination: '/blog/essential-spring-generator-maintenance-tips',
        permanent: true,
      },
      {
        source: '/blog/is-your-catskill-mini-split-making-unusual-sounds-heres-what-they-mean',
        destination: '/blog/mini-split-making-unusual-sounds',
        permanent: true,
      },
      {
        source: '/blog/solutions-for-frequent-circuit-breaker-trips-in-your-hudson-home',
        destination: '/blog/solutions-for-frequent-circuit-breaker-trips',
        permanent: true,
      },
      {
        source: '/blog/why-your-catskill-home-needs-regular-electrical-safety-checks-this-spring',
        destination: '/blog/why-home-needs-regular-electrical-safety-checks',
        permanent: true,
      },
      {
        source: '/blog/the-best-locations-to-install-a-mini-split-ac-in-your-woodstock-home',
        destination: '/blog/best-locations-to-install-a-mini-split-ac',
        permanent: true,
      },
      {
        source: '/blog/why-your-outdoor-landscape-lighing-should-last-more-than-one-season',
        destination: '/blog/why-your-outdoor-landscape-lighting-should-last-more-than-one-season',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
