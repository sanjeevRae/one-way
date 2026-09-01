import type { NextConfig } from "next";

// Production is served from the ROOT domain (https://onewaynepal.com/),
// so NEXT_PUBLIC_BASE_PATH should be EMPTY (or unset)→ basePath = "".

// If ever deployed to a sub-folder (e.g. /new), set it to the sub-path instead.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
