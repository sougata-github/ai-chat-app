"use server";

import { cookies } from "next/headers";
import { type ModelId, DEFAULT_MODEL_ID, isValidModelId } from "./model";

export async function saveChatModelAsCookie(model: ModelId) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("chat-model", model, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    console.error("Failed to save model to cookie:", error);
  }
}

export async function getChatModelFromCookies(): Promise<ModelId> {
  try {
    const cookieStore = await cookies();
    const model = cookieStore.get("chat-model")?.value;

    if (model && isValidModelId(model)) {
      return model;
    }
  } catch (error) {
    console.error("Failed to get model from cookie:", error);
  }

  return DEFAULT_MODEL_ID;
}
