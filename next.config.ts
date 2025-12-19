import type { NextConfig } from "next";

// Suppress ECONNRESET errors in development (normal when clients disconnect during streams)
if (process.env.NODE_ENV === "development") {
  process.on("uncaughtException", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ECONNRESET") {
      // Silently ignore - client disconnected during stream
      return;
    }
    console.error("Uncaught exception:", err);
  });
}

const nextConfig: NextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
