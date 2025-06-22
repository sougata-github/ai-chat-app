import { streamText, Message, smoothStream } from "ai";
import { SYSTEM_PROMPT } from "@/constants";
import { extractText } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";
import { id } from "zod/v4/locales";
import { db } from "@/db";

export async function POST(req: Request) {
  const { messages, id: chatId } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { user } = session;

  if (!messages || messages.length === 0) {
    return new Response("No messages found", { status: 400 });
  }

  // user prompt
  const lastMessage = messages[messages.length - 1];

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  //create new chat
  const chat = await db.chat.create({
    data: {
      id: chatId,
      userId: user.id,
      title: "New Chat",
    },
  });

  // Save user message to database
  const userMessage = await db.message.create({
    data: {
      id: lastMessage.id,
      role: "USER",
      chatId: chat.id,
      userId: user.id,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt || new Date(),
    },
  });

  // Convert UI messages to core messages for the LLM
  const coreMessages = messages.map((msg: Message) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
    experimental_transform: smoothStream({ chunking: "word" }),
    async onFinish({ response }) {
      try {
        const aiMessage = response.messages[0];

        if (aiMessage) {
          try {
            await db.message.create({
              data: {
                id: uuidv4(),
                role: "AI",
                chatId: chat.id,
                userId: user.id,
                content: extractText(aiMessage.content),
                promptId: userMessage.id,
                createdAt: new Date(),
              },
            });
          } catch (error) {
            console.error("Failed to save AI message:", error);
          }
        }

        if (!id && aiMessage) {
          try {
            const titleResult = streamText({
              model: google("gemini-2.0-flash-exp"),
              system:
                "You are a title summarizer. Generate a concise 4-6 word title.",
              prompt: `Summarize this conversation in 4-6 words: ${extractText(
                aiMessage.content
              )}`,
            });

            let title = "";
            for await (const delta of titleResult.textStream) {
              title += delta;
            }

            console.log("Chat Title", title);

            await db.chat.update({
              where: { id: chat.id },
              data: { title: title.trim() || "New Chat" },
            });
          } catch (error) {
            console.error("Failed to generate title:", error);
          }
        }
      } catch (error) {
        console.error("Unexpected error in onFinish:", error);
      }
    },
  });

  return result.toDataStreamResponse({
    headers: {
      "X-Chat-Id": chat.id,
    },
  });
}
