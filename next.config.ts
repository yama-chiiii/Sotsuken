// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/image/**',
      },
    ],
  },
}

export default nextConfig
