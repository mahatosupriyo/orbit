'use server'

import { revalidatePath } from 'next/cache'
import { getAuthUser } from '@/lib/getAuthUser'
import { db } from '@/server/db'
import { z } from 'zod'

/**
 * Utility to check if two dates fall on the same calendar day.
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Updates the authenticated user's name and/or username.
 * Constraints:
 * - Name and username can each be updated once per calendar day.
 * - Username must contain only alphabets (A–Z, a–z).
 * - If a username is already set, it cannot be removed (but can be updated).
 * 
 * Automatically revalidates the `/account` page upon success.
 * 
 * @param formData FormData with fields: name, username
 * @returns { success: true } or { error: string }
 */
export async function updateAccountInfo(formData: FormData) {
  // Step 1: Get authenticated user
  const session = await getAuthUser()
  if (!session.email) {
    return { error: 'User not authenticated' }
  }

  // Step 2: Extract raw input from FormData
  const raw = {
    name: formData.get('name'),
    username: formData.get('username'),
  }

  // Step 3: Fetch current user data to apply update constraints
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

  // Prepare rawUsername for comparison
  const rawUsername = typeof raw.username === 'string' ? raw.username : ''
  const transformedUsername = rawUsername === '' ? null : rawUsername

  // Step 4: Pre-validation checks
  if (raw.name && typeof raw.name === 'string' && raw.name !== user.name) {
    if (user.lastNameUpdate && isSameDay(user.lastNameUpdate, now)) {
      return { error: 'Name can only be updated once per day. Please try again tomorrow.' }
    }
  }

  if (transformedUsername !== user.username) {
    // Username already exists — prevent deletion
    if (user.username && transformedUsername === null) {
      return { error: 'You cannot remove your username once it has been set.' }
    }

    // Check daily update limit
    if (user.lastUsernameUpdate && isSameDay(user.lastUsernameUpdate, now)) {
      return { error: 'Username can only be updated once per day. Please try again tomorrow.' }
    }
  }

  // Step 5: Define validation schema (username must be alphabets only)
  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    username: z
      .union([
        z.string().regex(/^[a-zA-Z]+$/, {
          message: 'Username must contain only alphabets (A–Z or a–z)',
        }),
        z.literal(''),
        z.null(),
      ])
      .transform((val) => (val === '' ? null : val)),
  })

  // Step 6: Validate form data
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const errorMessage = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .join(', ')
    return { error: errorMessage }
  }

  // Step 7: Determine what needs to be updated
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

  // Step 8: Perform database update
  try {
    await db.user.update({
      where: { email: session.email },
      data: dataToUpdate,
    })
  } catch (err) {
    console.error('Failed to update user:', err)
    return { error: 'Failed to update account. Please try again later.' }
  }

  // Step 9: Revalidate the account page
  revalidatePath('/account')

  return { success: true }
}
