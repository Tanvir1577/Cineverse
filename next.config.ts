import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['firebase', 'framer-motion', 'lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
