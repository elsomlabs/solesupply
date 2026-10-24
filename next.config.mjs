/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.stockx.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "www.litlaces.com",
        pathname: "/cdn/shop/**",
      },
    ],
  },
};

export default nextConfig;
