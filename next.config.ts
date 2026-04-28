import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['brush-touch-electrical-malpractice.trycloudflare.com', 'encode-geology-audio.ngrok-free.dev'],
  turbopack: {
    resolveAlias: {
      '~': __dirname,
    },
  },
};

export default nextConfig;
