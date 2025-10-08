/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuração para resolver problemas com bibliotecas que usam Node.js APIs
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }

    // Configuração específica para a biblioteca docx
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'docx': 'commonjs docx',
        'jspdf': 'commonjs jspdf'
      });
    }

    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;