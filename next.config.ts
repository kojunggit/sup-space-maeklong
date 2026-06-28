import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // allow next/image to serve local public/ images
    unoptimized: process.env.NODE_ENV === "development",
  },
  async rewrites() {
    return {
      // runs before static-file lookup so newly uploaded files are served
      // via the API route (which reads from disk live) rather than the
      // static-file cache that Next.js builds at server startup
      beforeFiles: [
        { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
      ],
    };
  },
};

export default nextConfig;
