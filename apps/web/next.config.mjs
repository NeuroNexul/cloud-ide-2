/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        hostname: "vscode-icons.github.io",
      },
    ],
  },
};

export default nextConfig;
