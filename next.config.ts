import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set the root directory to avoid lockfile detection issues
  // This resolves the warning about multiple lockfiles in parent directories
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
