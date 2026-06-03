import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

const COOKIE_NAME = "tgc_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminSession = {
  sub: "admin";
  exp: number;
  nonce: string;
};

function base64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sign(value: string): string {
  return createHmac("sha256", env.adminSessionSecret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function getCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) return rawValue.join("=");
  }
  return undefined;
}

export function verifyAdminPassword(password: string): boolean {
  if (env.adminPasswordHash) {
    return safeEqual(sha256(password), env.adminPasswordHash.toLowerCase());
  }

  if (!env.adminPassword) {
    throw new Error("Admin password is not configured");
  }

  return safeEqual(password, env.adminPassword);
}

export function createAdminSession(): string {
  const payload: AdminSession = {
    sub: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("hex"),
  };
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminSession(cookieHeader: string | null): boolean {
  const token = getCookie(cookieHeader, COOKIE_NAME);
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    return session.sub === "admin" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function serializeAdminSessionCookie(token: string): string {
  const secure = env.isProduction ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function serializeAdminLogoutCookie(): string {
  const secure = env.isProduction ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
