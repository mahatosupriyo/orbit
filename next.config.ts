import "./src/env.js";
/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}