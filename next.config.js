/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true
  },
  trailingSlash: true,
  output: 'export'
}

module.exports = nextConfig