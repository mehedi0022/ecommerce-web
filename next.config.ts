import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/track",
        destination: "/track-order",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // Matches the port in your error message
        pathname: "/uploads/**", // Optional: restrict to specific paths
      },
    ],
  },
};

export default nextConfig;
