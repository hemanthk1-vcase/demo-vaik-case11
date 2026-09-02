import { secrets } from "base44:runtime";

const encoder = new TextEncoder();

async function hmacHex(message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secrets.get("BASE44_APP_ID")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function makeChallenge(userId, code, expiresMs) {
  const sig = await hmacHex(`${userId}:${code}:${expiresMs}`);
  return `${userId}.${expiresMs}.${sig}`;
}

export async function checkChallenge(challenge, code) {
  const parts = String(challenge || "").split(".");
  if (parts.length !== 3) return { ok: false };
  const [userId, expiresStr, sig] = parts;
  const expires = Number(expiresStr);
  if (!userId || !expires || Date.now() > expires) return { ok: false };
  const expected = await hmacHex(`${userId}:${code}:${expires}`);
  if (expected.length !== sig.length) return { ok: false };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return { ok: diff === 0, userId };
}