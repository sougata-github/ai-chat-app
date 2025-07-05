"use server";

import { cookies } from "next/headers";
import { type Tool, isValidTool } from "./tool";

export async function saveToolAsCookie(tool: Tool) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("chat-tool", tool, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    console.error("Failed to save tool to cookie:", error);
  }
}

export async function getToolFromCookies(): Promise<Tool> {
  try {
    const cookieStore = await cookies();
    const tool = cookieStore.get("chat-tool")?.value;

    if (tool && isValidTool(tool)) {
      return tool;
    }
  } catch (error) {
    console.error("Failed to get tool from cookie:", error);
  }

  return "none";
}
