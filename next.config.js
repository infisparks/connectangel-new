/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add your Supabase storage domain here
    // Replace 'YOUR_PROJECT_REF.supabase.co' with your actual Supabase project reference
    domains: ['images.pexels.com', 'cvcmjtyamlwgkcmsiemd.supabase.co'], // Ensure your Supabase domain is here
    unoptimized: true, // Keep unoptimized if you are serving directly from Supabase CDN without Next.js optimization
  },
  trailingSlash: true,
  // output: 'export'
}

module.exports = nextConfig