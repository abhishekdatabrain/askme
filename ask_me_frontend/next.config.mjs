/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.11",
    "192.168.1.21",
    "192.168.1.8",

  ],
  reactCompiler: true,
  async rewrites() {
    const apiBase = (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NEXT_PUBLIC_SOCKET_URL
        ? `${process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '')}/api`
        : 'http://localhost:5003/api')
    ).replace(/\/+$/, '');
    const uploadDest = apiBase.endsWith('/api')
      ? `${apiBase}/uploads/:path*`
      : `${apiBase}/api/uploads/:path*`;
    return [
      {
        source: '/uploads/:path*',
        destination: uploadDest,
      },
    ];
  },
};

export default nextConfig;
