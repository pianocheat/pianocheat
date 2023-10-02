/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["ui", "score", "scorebuilder"],
};

export default nextConfig;
