/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // 정적 내보내기를 활성화합니다
  images: {
    unoptimized: true,  // Netlify에 배포할 때 이미지 최적화 비활성화
  },
}

module.exports = nextConfig
