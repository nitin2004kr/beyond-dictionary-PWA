import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
    reactStrictMode: true,
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

export default pwaConfig(nextConfig);
