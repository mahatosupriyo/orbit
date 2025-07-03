import { z } from "zod"

export const avatarUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
        .refine(
            (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
            "File must be a JPEG, PNG, GIF, or WebP image",
        ),
})

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>
