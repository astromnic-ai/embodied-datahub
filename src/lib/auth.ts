import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "default-secret-key";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: { username: string; expires: Date }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expires)
    .sign(key);
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as { username: string; expires: Date };
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (username === adminUsername && password === adminPassword) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ username, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return session; // Return token for CLI usage
  }

  return null;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  // First, try to get token from Authorization header (for CLI)
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return await decrypt(token);
  }
  
  // Fall back to cookie-based session (for web)
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function isAuthenticated() {
  const session = await getSession();
  if (!session) return false;
  return new Date(session.expires) > new Date();
}
