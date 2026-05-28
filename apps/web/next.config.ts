import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fiche/db", "@fiche/ui"],
};

export default config;
