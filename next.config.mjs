/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint:{
        ignoreDuringBuilds:true
    },
    images:{
        domains:['lh3.googleusercontent.com']
    },
    webpack: (config, { isServer }) => {
        config.watchOptions = {
          ignored: /public/
        }
        return config
      },
};

export default nextConfig;
