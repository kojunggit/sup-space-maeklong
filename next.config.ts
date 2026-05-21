import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // allow next/image to serve local public/ images
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
