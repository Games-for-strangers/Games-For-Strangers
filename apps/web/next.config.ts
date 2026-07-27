import "@gamesforstrangers/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
