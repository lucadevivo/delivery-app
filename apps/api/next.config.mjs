/** @type {import('next').NextConfig} */
const nextConfig = {
  // I package del monorepo sono consumati come sorgente TS: vanno transpilati.
  transpilePackages: ["@rider/core", "@rider/db"],
  // Output autonomo per un'immagine Docker minimale in produzione.
  output: "standalone",
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
}

export default nextConfig
