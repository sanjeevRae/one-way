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
    // Admins can paste images from any https source, so allow all hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
