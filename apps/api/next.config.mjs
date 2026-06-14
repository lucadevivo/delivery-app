/** @type {import('next').NextConfig} */
const nextConfig = {
  // I package del monorepo sono consumati come sorgente TS: vanno transpilati.
  transpilePackages: ["@rider/core", "@rider/db"],
}

export default nextConfig
