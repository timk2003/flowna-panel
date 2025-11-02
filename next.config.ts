import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimierungen für Produktion
  reactStrictMode: true,
  
  // Image-Optimierung
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
