import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@wai/storage", "@wai/shared"] };
export default nextConfig;