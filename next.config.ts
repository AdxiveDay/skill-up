
/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // เปลี่ยนจาก default 1mb เป็น 100mb
    },
  },
};

module.exports = nextConfig;