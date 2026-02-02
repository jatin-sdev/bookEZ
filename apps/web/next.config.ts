import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig = {
  output: "standalone", // <--- THIS IS CRITICAL
  /* config options here */
  reactCompiler: true,
  
  // Ignore linting and type checking during build (handled in CI step)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack needs monorepo root to resolve packages correctly
  // Watchman will handle directory exclusions via .watchmanconfig
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
