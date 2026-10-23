import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  agentRules: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ddragon.leagueoflegends.com" },
      { protocol: "https", hostname: "raw.communitydragon.org" },
    ],
  },
};

export default nextConfig;
