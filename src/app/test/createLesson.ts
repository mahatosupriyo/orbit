// app/actions/course/createLesson.ts
'use server'

import { db } from '@/server/db'
import { z } from 'zod'
import { auth } from '@/auth'

const lessonSchema = z.object({
  courseId: z.number(),
  title: z.string().min(1),
  content: z.string().optional(),
  videoAssetId: z.number(),
  order: z.number(),
})

export async function createLesson(data: z.infer<typeof lessonSchema>) {
  const user = await auth()
  if (!user) throw new Error('Unauthorized')

  const parsed = lessonSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid input')

  const lesson = await db.lesson.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      courseId: parsed.data.courseId,
      videoId: parsed.data.videoAssetId,
      order: parsed.data.order,
    },
  })

  return lesson
}
