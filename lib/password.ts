import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Hash de contraseñas del panel (login con correo + contraseña, ver
// app/api/auth/password/route.ts). scrypt nativo de Node en vez de bcrypt:
// cero dependencias nuevas y es un KDF lento a propósito, igual de apto.
// Formato guardado: "scrypt$<salt b64>$<hash b64>".
const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, keyB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
