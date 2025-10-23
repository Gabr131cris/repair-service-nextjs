import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // Ignoră erorile ESLint la build (optional)
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Ignoră erorile TS la build (optional)
    ignoreBuildErrors: true,
  },

  // 🔹 Dacă vrei, poți activa optimizări suplimentare
  images: {
    // Permite imagini locale + remote
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
