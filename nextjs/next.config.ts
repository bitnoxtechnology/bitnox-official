import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The legacy client/ and server/ apps leave lockfiles above this directory, so Turbopack
  // infers the wrong workspace root. Pin it. Remove once those apps are deleted at cutover.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  // Cache Components: enables `use cache`, `cacheTag` and `cacheLife`, which is how public
  // pages are statically generated and invalidated by tag on admin mutation.
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
