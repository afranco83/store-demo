import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@store-demo/ui", "@store-demo/shared-types", "@store-demo/api-client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ed33klzl/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
