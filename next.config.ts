import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'www.identiprint.it',
        pathname: '/img_prodotti/**',
      },
      {
        protocol: 'https',
        hostname: 'www.identiprint.it',
        pathname: '/img_prodotti/**',
      },
      {
        protocol: 'https',
        hostname: 'www.caffeborbone.com',
        pathname: '/dw/image/**',
      },
    ],
  },
};

export default nextConfig;
