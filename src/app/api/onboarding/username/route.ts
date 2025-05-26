import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/server/db';

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const newUsername = body.username?.trim().toLowerCase();

  if (!newUsername || newUsername.length < 3) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }

  // Check if username already exists
  const existing = await db.user.findUnique({
    where: { username: newUsername },
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const lastChanged = user?.lastUsernameUpdate;
  const now = new Date();

  if (lastChanged && now.getTime() - new Date(lastChanged).getTime() < 7 * 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: 'Username can only be changed once every 7 days' },
      { status: 403 }
    );
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      username: newUsername,
      lastUsernameUpdate: now,
    },
  });

  return NextResponse.json({ success: true, username: newUsername });
}
