import { cookies } from "next/headers";

export const USER_ID_COOKIE = "userId";

export async function getUserIdFromCookie() {
  return (await cookies()).get(USER_ID_COOKIE)?.value ?? null;
}

export async function setUserIdCookie(userId: string) {
  (await cookies()).set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
