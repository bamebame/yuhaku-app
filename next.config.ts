import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false, // 開発環境でのダブルレンダリング回避
  images: {
    remotePatterns: [],
  },
  experimental: {
    // Server Actions最適化
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig