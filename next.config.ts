import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos que se suben desde el admin de Delasoft se guardan en Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    serverActions: {
      // El comprobante de pago se comprime en el navegador, pero se deja margen.
      // Vercel no acepta cuerpos de más de 4.5 MB.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
