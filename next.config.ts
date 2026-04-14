import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevents Supabase auth lock double-mount issue
};

export default nextConfig;
