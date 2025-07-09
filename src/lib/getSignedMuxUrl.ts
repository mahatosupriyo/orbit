"use server";

import jwt from "jsonwebtoken";

const SIGNING_KEY_ID = process.env.MUX_SIGNING_ID!;
const PRIVATE_KEY = process.env.MUX_PRIVATE_KEY!.replace(/\\n/g, "\n");

function createToken(playbackId: string, aud: "v" | "t") {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: playbackId,
    aud: 'v',
    exp: now + 1800, // 30 minutes
    kid: SIGNING_KEY_ID,
  }
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" },

  );
}

// ✅ Make this async to avoid server action error
export async function getSignedMuxUrl(playbackId: string) {
  const token = createToken(playbackId, "v");
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
}

// ✅ Make this async as well
export async function getSignedPosterUrl(playbackId: string) {
  const token = createToken(playbackId, "t");
  return `https://image.mux.com/${playbackId}/thumbnail.webp?token=${token}`;
}
