const ITERATIONS = 100_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;
const ALGORITHM = "pbkdf2-sha256";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(
  pin: string,
  salt: Uint8Array,
  iterations: number,
  bytes: number
): Promise<Uint8Array> {
  const enc = new TextEncoder().encode(pin);
  const key = await crypto.subtle.importKey(
    "raw",
    enc as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    key,
    bytes * 8
  );
  return new Uint8Array(derived);
}

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(pin, salt, ITERATIONS, HASH_BYTES);
  return `${ALGORITHM}$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== ALGORITHM) return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  const salt = hexToBytes(parts[2]);
  const expected = hexToBytes(parts[3]);
  const computed = await pbkdf2(pin, salt, iterations, expected.length);
  return timingSafeEqual(computed, expected);
}
