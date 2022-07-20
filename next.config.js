/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  distDir: "build",
  assetPrefix: ".",
  assetPrefix: isProd
    ? // ? "https://cdn.statically.io/gh/NaveenDA/naveenda.github.io/gh-pages/"
      "https://cdn.statically.io/gh/peter-thundercore/simple-mining-transfer/gh-pages/"
    : "",
};

module.exports = nextConfig;
