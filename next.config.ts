import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false, // 開発環境でのダブルレンダリング回避
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  experimental: {
    // Server Actions最適化
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig