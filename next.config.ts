import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "njportal.thenoncoders.in",
        pathname: "/**", // allow all paths
      },
    ],
  },
};

export default nextConfig;