import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import "./src/env.js";

const nextConfig: NextConfig = {
  // Add your Next.js config options here
};

export default withNextVideo(nextConfig);