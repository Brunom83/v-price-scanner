/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- ESTA É A LINHA MÁGICA QUE FALTA ---
  output: "standalone", 
  // ----------------------------------------

  // O Túnel para o Backend
  async rewrites() {
    return [
      {
        source: "/api/python/:path*",
        destination: "http://backend:8000/:path*",
      },
    ];
  },
};

export default nextConfig;