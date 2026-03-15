import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack 설정 (Next.js 16 기본)
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // webpack 설정도 유지 (--webpack 플래그 사용 시)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },
};

export default nextConfig;

