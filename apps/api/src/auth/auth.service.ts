import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { signAccessToken, signRefreshToken } from "./auth.utils";

export const registerUser = async (fullName: string, email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existingUser) throw new Error("Email already in use");
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    fullName,
    email: normalizedEmail,
    passwordHash,
    role: "USER",
  });
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return {
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    refreshToken: signRefreshToken({ id: user.id }),
  };
};

export const refreshUserToken = async (token: string) => {
  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
  });

  if (!user) throw new Error("User no longer exists");

  // ROTATION: Issue NEW access token AND NEW refresh token
  return {
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    refreshToken: signRefreshToken({ id: user.id }),
  };
};