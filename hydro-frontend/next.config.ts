import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://hydrotrack-backend.vercel.app'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
