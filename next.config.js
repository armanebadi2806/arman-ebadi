/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: false
  },
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
