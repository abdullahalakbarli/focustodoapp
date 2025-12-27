import crypto from "crypto";
import bcrypt from "bcryptjs";

export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}


