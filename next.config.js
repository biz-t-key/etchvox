/** @type {import('next').NextConfig} */
const nextConfig = {
    // Dynamic routes enabled (no static export)
    // Vercel serverless functions will handle dynamic routes

    // Disable image optimization for simplicity
    images: {
        unoptimized: true,
    },

    // Trailing slash for cleaner URLs
    trailingSlash: true,
};

module.exports = nextConfig;
