"use server";

import { cookies } from "next/headers";
import { type ToolMode, isValidToolMode } from "./tool";

export async function saveToolModeAsCookie(mode: ToolMode) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("chat-tool-mode", mode, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    console.error("Failed to save tool mode to cookie:", error);
  }
}

export async function getToolModeFromCookies(): Promise<ToolMode> {
  try {
    const cookieStore = await cookies();
    const mode = cookieStore.get("chat-tool-mode")?.value;

    if (mode && isValidToolMode(mode)) {
      return mode;
    }
  } catch (error) {
    console.error("Failed to get tool mode from cookie:", error);
  }

  return "text";
}
