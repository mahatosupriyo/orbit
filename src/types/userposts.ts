import { z } from "zod";

// Fix: Make the schema more flexible and handle edge cases
export const GaragePostSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  caption: z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional().or(z.literal("")),
  createdAt: z.string().datetime(), // Fix: Use datetime validation for ISO strings
  images: z.array(
    z.object({
      id: z.number(),
      url: z.string().url("Invalid image URL"),
      order: z.number().nullable().optional(),
    })
  ).min(0, "Images array is required"), // Allow empty arrays
  makingOf: z
    .object({
      id: z.number(),
      playbackID: z.string().min(1, "Playback ID is required"),
    })
    .nullable()
    .optional(),
});

export type GaragePost = z.infer<typeof GaragePostSchema>;

// Additional helper types
export type GaragePostImage = {
  id: number;
  url: string;
  order: number | null;
};

export type GaragePostVideo = {
  id: number;
  playbackID: string;
};
