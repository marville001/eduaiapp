import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'eduaiapp-black.vercel.app', pathname: '/**' },
    ]
  }
  /* config options here */
};

export default nextConfig;
