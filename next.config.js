/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Standalone output is for Docker only — it breaks Vercel deployments.
if (process.env.DOCKER_BUILD === "true") {
  nextConfig.output = "standalone";
}

module.exports = nextConfig;
