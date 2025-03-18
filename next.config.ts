import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // These will be replaced by actual environment variables at runtime
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    // Stripe Configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    // IP Geolocation Service
    IPSTACK_API_KEY: process.env.IPSTACK_API_KEY,
  },
  // Ensure server-side rendering for authentication pages
  reactStrictMode: true,

  // Performance optimizations
  images: {
    domains: ["tuning-portal.eu"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable compression
  compress: true,

  // Add performance optimization
  poweredByHeader: false,

  // Add output configuration for better performance
  output: "standalone",

  // Configure redirects for common patterns
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Configure caching headers
  async headers() {
    return [
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|webp|svg|ico|ttf|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(css|js)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Add specific caching for API routes
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          // HTTP Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Cross-Origin-Opener-Policy (COOP)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },

          // Cross-Origin-Resource-Policy (CORP)
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },

          // X-Frame-Options (XFO)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Additional recommended security headers
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), autoplay=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
          },

          // Add NEL (Network Error Logging)
          {
            key: "NEL",
            value:
              '{"report_to":"default","max_age":31536000,"include_subdomains":true}',
          },

          // Add Reporting-Endpoints header
          {
            key: "Reporting-Endpoints",
            value: 'default="https://tuning-portal.eu/api/reporting"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
