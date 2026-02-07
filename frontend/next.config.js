/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', 'react-force-graph-3d'],
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (already checked in development)
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude 3D libraries from server-side rendering
    if (isServer) {
      config.externals = [
        ...config.externals,
        'three',
        'react-force-graph-3d',
        'd3-selection',
        'd3-zoom',
        'd3-drag',
        'canvas',
      ];
    }

    // Handle canvas module
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];

    return config;
  },
};

module.exports = nextConfig;
