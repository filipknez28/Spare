/**
 * Local account + passcode layer for Spare.
 *
 * The passcode is hashed with PBKDF2-SHA-256 (Web Crypto) before it ever
 * touches storage; the raw digits are never persisted. The account record
 * lives in localStorage under "spare-account-v1" and is what the lock screen
 * verifies against. All reads are guarded so server rendering never crashes.
 */

export type SpareAccount = {
  name: string;
  /** Hex-encoded random salt. */
  salt: string;
  /** Hex-encoded PBKDF2 hash of the passcode. */
  hash: string;
  iterations: number;
  pinLength: number;
  createdAt: string;
};

const ACCOUNT_KEY = "spare-account-v1";
export const PBKDF2_ITERATIONS = 150_000;
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function readAccount(): SpareAccount | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpareAccount;
    if (!parsed || typeof parsed.hash !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAccount(account: SpareAccount | null): void {
  if (typeof localStorage === "undefined") return;
  if (account == null) {
    localStorage.removeItem(ACCOUNT_KEY);
    return;
  }
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

async function deriveHash(
  salt: string,
  pin: string,
  iterations: number,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(salt), iterations },
    keyMaterial,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function createAccount(
  name: string,
  pin: string,
): Promise<SpareAccount> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await deriveHash(salt, pin, PBKDF2_ITERATIONS);
  const account: SpareAccount = {
    name: name.trim() || "you",
    salt,
    hash,
    iterations: PBKDF2_ITERATIONS,
    pinLength: pin.length,
    createdAt: new Date().toISOString(),
  };
  writeAccount(account);
  return account;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const account = readAccount();
  if (!account) return false;
  const hash = await deriveHash(account.salt, pin, account.iterations);
  return timingSafeEqual(hash, account.hash);
}

export async function changePin(
  current: string,
  next: string,
): Promise<boolean> {
  const account = readAccount();
  if (!account) return false;
  if (!(await verifyPin(current))) return false;
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await deriveHash(salt, next, PBKDF2_ITERATIONS);
  writeAccount({
    ...account,
    salt,
    hash,
    iterations: PBKDF2_ITERATIONS,
    pinLength: next.length,
  });
  return true;
}

/** Removes the account record. Does NOT touch ledger data. */
export function clearAccount(): void {
  writeAccount(null);
}
