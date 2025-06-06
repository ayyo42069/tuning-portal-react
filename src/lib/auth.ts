import { sign, verify } from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { executeQuery, getRow } from "./db";
import { encryptMessage, decryptMessage } from "./encryption";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

// Password encryption using AES-256
export async function hashPassword(password: string): Promise<string> {
  return encryptMessage(password);
}

// Password verification using AES-256
export async function verifyPassword(
  password: string,
  encryptedPassword: string
): Promise<boolean> {
  try {
    const decryptedPassword = decryptMessage(encryptedPassword);
    return password === decryptedPassword;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

// JWT token generation
export function generateToken(user: User): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
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

// Set auth cookie
export function setAuthCookie(token: string): string {
  return serialize("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    // Remove domain setting to allow cookies to work in all environments
    // domain: process.env.NODE_ENV === "production" ? ".tuning-portal.eu" : undefined
  });
}

// Get auth cookie
export function getAuthCookie(cookies: string): string | null {
  const parsedCookies = parse(cookies || "");
  return parsedCookies.auth_token || null;
}
