import { streamText, Message, smoothStream } from "ai";
import { SYSTEM_PROMPT } from "@/constants";
import { extractText } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";

export async function POST(req: Request) {
  const { messages, id } = await req.json();

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

  if (!id) {
    return new Response("Chat ID is required", { status: 400 });
  }

  // Verify chat belongs to user
  const chat = await db.chat.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  // user prompt
  const lastMessage = messages[messages.length - 1];

  // Save user message to database
  const userMessage = await db.message.create({
    data: {
      id: lastMessage.id,
      role: "USER",
      chatId: id,
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
    model: google("gemini-2.0-flash-exp"),
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
                chatId: id,
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
      } catch (error) {
        console.error("Unexpected error in onFinish:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
