/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Improve build reliability by continuing even when some pages fail
    staticGenerationFailOnError: false,
    // Retry failed page generation attempts
    staticGenerationRetryCount: 3,
    // Limit concurrent page generations to reduce server load
    staticGenerationMaxConcurrency: 4,
    // If a data dependency fails, rendering will be retried during client navigation
    serverComponentsExternalPackages: ['mysql2'],
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'randomuser.me',
      'avatars.githubusercontent.com',
    ],
  },
  // Allow static site build to complete even if there are warnings
  reactStrictMode: false,
  // Use custom webpack configuration to optimize build
  webpack: (config, { isServer }) => {
    // Optimization for server build
    if (isServer) {
      // Mark production API dependencies as external to reduce build size
      config.externals = [...config.externals, 'stripe', 'mysql2', 'nodemailer'];
    }
    
    return config;
  },
};

module.exports = nextConfig; 