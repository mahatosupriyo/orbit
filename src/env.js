import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    NEXTAUTH_SECRET:
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

    NEXT_PUBLIC_NEXTAUTH_URL: z.string().url(),


    // ORBIT AWS credentials and settings
    ORBIT_AWS_ACCESS_KEY_ID: z.string(),
    ORBIT_AWS_SECRET_ACCESS_KEY: z.string(),
    ORBIT_AWS_REGION: z.string(),
    ORBIT_S3_BUCKET_NAME: z.string(),
    ORBIT_CLOUDFRONT_URL: z.string().url(),
    ORBIT_CLOUDFRONT_KEY_PAIR_ID: z.string(),
    ORBIT_CLOUDFRONT_PRIVATE_KEY: z.string(), // consider secure handling
  },

  /**
   * Client-side environment variables schema
   */
  client: {
    // If you need to expose any ORBIT_ env to the client, move it here with NEXT_PUBLIC_ prefix
    // Example: NEXT_PUBLIC_ORBIT_CLOUDFRONT_URL: z.string().url()
  },

  /**
   * Runtime environment mapping
   */
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL, 


    ORBIT_AWS_ACCESS_KEY_ID: process.env.ORBIT_AWS_ACCESS_KEY_ID,
    ORBIT_AWS_SECRET_ACCESS_KEY: process.env.ORBIT_AWS_SECRET_ACCESS_KEY,
    ORBIT_AWS_REGION: process.env.ORBIT_AWS_REGION,
    ORBIT_S3_BUCKET_NAME: process.env.ORBIT_S3_BUCKET_NAME,
    ORBIT_CLOUDFRONT_URL: process.env.ORBIT_CLOUDFRONT_URL,
    ORBIT_CLOUDFRONT_KEY_PAIR_ID: process.env.ORBIT_CLOUDFRONT_KEY_PAIR_ID,
    ORBIT_CLOUDFRONT_PRIVATE_KEY: process.env.ORBIT_CLOUDFRONT_PRIVATE_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
