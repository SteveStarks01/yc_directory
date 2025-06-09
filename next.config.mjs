import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    // Enable performance features
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-card',
      '@radix-ui/react-select',
      '@radix-ui/react-textarea',
      'react-hook-form',
      'use-debounce'
    ],
    // Server components optimization moved to root level
    // Enable partial prerendering for better performance
    ppr: false, // Disable for now due to experimental nature
  },
  
  // Disable static analysis during builds to prevent memory issues
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Temporarily disable webpack optimizations to fix exports error
  // webpack: (config, { dev, isServer }) => {
  //   return config;
  // },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Reduce memory usage for image optimization
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Server external packages optimization
  serverExternalPackages: ['@sanity/client'],

  // Optimize output
  output: 'standalone',
  
  // Reduce memory usage during static generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default withBundleAnalyzer(nextConfig);
