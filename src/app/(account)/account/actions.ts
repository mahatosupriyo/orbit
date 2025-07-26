'use server'

import { revalidatePath } from 'next/cache'
import { getAuthUser } from '@/lib/getAuthUser'
import { db } from '@/server/db'
import { z } from 'zod'

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

// Add your reserved routes here
const RESERVED_USERNAMES = [
  'account',
  'admin',
  'api',
  'garage',
  'odyssey',
  'create',
  'space',
  'delete',
  'login',
  'accounts',
  'profile',
  'profiles',
  'logout',
  'signup',
  'settings',
  'setting',
  'payment',
  'payments',
  'history',
  'dashboard',
  'explore',
  'home',
  'auth',
  'about',
  'contact',
  'contacts',
  'privacy',
  'terms',
  'favicon.ico',
  'robots.txt',
]

export async function updateAccountInfo(formData: FormData) {
  const session = await getAuthUser()
  if (!session.email) {
    return { error: 'User not authenticated' }
  }

  const raw = {
    name: formData.get('name'),
    username: formData.get('username'),
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
    select: {
      name: true,
      username: true,
      lastUsernameUpdate: true,
      lastNameUpdate: true,
    },
  })

  if (!user) {
    return { error: 'User not found' }
  }

  const now = new Date()

  const rawUsername = typeof raw.username === 'string' ? raw.username.trim().toLowerCase() : ''
  const transformedUsername = rawUsername === '' ? null : rawUsername

  // Name update constraint
  if (raw.name && typeof raw.name === 'string' && raw.name !== user.name) {
    if (user.lastNameUpdate && isSameDay(user.lastNameUpdate, now)) {
      return { error: 'Name can only be updated once per day. Please try again tomorrow.' }
    }
  }

  // Username update constraints
  if (transformedUsername !== user.username) {
    if (user.username && transformedUsername === null) {
      return { error: 'You cannot remove your username once it has been set.' }
    }

    if (user.lastUsernameUpdate && isSameDay(user.lastUsernameUpdate, now)) {
      return { error: 'Username can only be updated once per day. Please try again tomorrow.' }
    }

    // ✅ Reserved route check
    if (transformedUsername && RESERVED_USERNAMES.includes(transformedUsername)) {
      return { error: 'This username is not allowed. Please choose another.' }
    }

    // Username availability check
    if (transformedUsername) {
      const usernameTaken = await db.user.findFirst({
        where: {
          username: transformedUsername,
          NOT: { email: session.email },
        },
      })

      if (usernameTaken) {
        return { error: 'Username is already taken. Please choose another.' }
      }
    }
  }

  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(32, 'Name must be at most 32 characters'),
    username: z
      .union([
        z
          .string()
          .min(3, 'Username must be at least 3 characters')
          .max(32, 'Username must be at most 32 characters')
          .regex(/^[a-zA-Z]+$/, {
            message: 'Username must contain only alphabets (A–Z or a–z)',
          }),
        z.literal(''),
        z.null(),
      ])
      .transform((val) => (val === '' ? null : val?.toLowerCase())),
  })

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const errorMessage = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
    return { error: errorMessage }
  }

  const dataToUpdate: Record<string, any> = {}

  if (parsed.data.name !== user.name) {
    dataToUpdate.name = parsed.data.name
    dataToUpdate.lastNameUpdate = now
  }

  if (parsed.data.username !== user.username) {
    dataToUpdate.username = parsed.data.username
    dataToUpdate.lastUsernameUpdate = now
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return { error: 'No changes detected.' }
  }

  try {
    await db.user.update({
      where: { email: session.email },
      data: dataToUpdate,
    })
  } catch (err) {
    console.error('Failed to update user:', err)
    return { error: 'Failed to update account. Please try again later.' }
  }

  revalidatePath('/account')

  return { success: true }
}
