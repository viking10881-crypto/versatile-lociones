import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos que se suben desde el admin de Delasoft se guardan en Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
