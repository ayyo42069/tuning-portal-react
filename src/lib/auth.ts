import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { executeQuery, getRow } from "./db";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface Session {
  id: string;
  user_id: number;
  expires_at: Date;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

// Password verification
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// JWT token generation
export function generateToken(user: User): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

// JWT token verification
export function verifyToken(token: string): any {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    return null;
  }

  try {
    return verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const sessionId = Math.random().toString(36).substring(2);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await executeQuery(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    [sessionId, userId, expiresAt]
  );

  return sessionId;
}

// Get session
export async function getSession(sessionId: string): Promise<Session | null> {
  return await getRow<Session>(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
    [sessionId]
  );
}

// Set auth cookie
export function setAuthCookie(token: string): string {
  return serialize("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Get auth cookie
export function getAuthCookie(cookies: string): string | null {
  const parsedCookies = parse(cookies || "");
  return parsedCookies.auth_token || null;
}
