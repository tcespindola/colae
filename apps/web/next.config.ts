import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@colae/pricing", "@colae/db"] };
export default nextConfig;