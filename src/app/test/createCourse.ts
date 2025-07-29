// app/actions/course/createCourse.ts
'use server'

import { db } from '@/server/db'
import { z } from 'zod'
import { auth } from '@/auth'

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

export async function createCourse(data: z.infer<typeof courseSchema>) {
  const user = await auth()
  if (!user) throw new Error('Unauthorized')

  const parsed = courseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid input')

  const course = await db.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      createdById: user.user.id,
    },
  })

  return course
}
