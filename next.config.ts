import type { NextConfig } from "next";

// Served from a sub-folder (onewaynepal.com/new) on Spaceship.
// On production, set NEXT_PUBLIC_BASE_PATH=/new so assets & routes resolve.
// Locally it stays empty → app runs at http://localhost:3000.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "s.magecdn.com",
      },
    ],
  },
};

export default nextConfig;
