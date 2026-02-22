import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 서버리스 환경에서 Prisma/SQLite 관련 경고 무시
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
