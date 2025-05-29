import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GITHUB_ID: z.string(),
    AUTH_GITHUB_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string(),

    // ORBIT AWS credentials and settings
    // ORBIT_AWS_ACCESS_KEY_ID: z.string(),
    // ORBIT_AWS_SECRET_ACCESS_KEY: z.string(),
    // ORBIT_AWS_REGION: z.string(),
    // ORBIT_S3_BUCKET_NAME: z.string(),
    // ORBIT_CLOUDFRONT_URL: z.string().url(),
  },

  /**
   * Client-side environment variables schema
   */
  client: {
    // Example: NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  /**
   * Runtime environment mapping
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    // ORBIT_AWS_ACCESS_KEY_ID: process.env.ORBIT_AWS_ACCESS_KEY_ID,
    // ORBIT_AWS_SECRET_ACCESS_KEY: process.env.ORBIT_AWS_SECRET_ACCESS_KEY,
    // ORBIT_AWS_REGION: process.env.ORBIT_AWS_REGION,
    // ORBIT_S3_BUCKET_NAME: process.env.ORBIT_S3_BUCKET_NAME,
    // ORBIT_CLOUDFRONT_URL: process.env.ORBIT_CLOUDFRONT_URL,

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
