import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow Next.js hot module replacement over ngrok tunnels in dev mode
  // Note: you may need to update this URL if your ngrok tunnel restarts
  experimental: {
    // Some next.js versions place it inside experimental or directly
    // based on the console log it is at the root:
  },
  // Note: allowedDevOrigins is primarily for local ngrok development
  ...(process.env.NODE_ENV === 'development' ? {
    allowedDevOrigins: [
      "25c3-2409-40f4-3014-8ef-1c1c-fee7-2814-7051.ngrok-free.app",
      "localhost:3000"
    ]
  } : {})
};

export default nextConfig;
