import { generateTitleFromUserMessage, getChatById } from "@/lib/chat";
import { streamText, Message, smoothStream } from "ai";
import { SYSTEM_PROMPT } from "@/constants";
import { extractText } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";
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

  if (
    !lastMessage ||
    typeof lastMessage.content !== "string" ||
    !lastMessage.content.trim()
  ) {
    return new Response("Invalid last message", { status: 400 });
  }

  //check if chat exists
  const existingChat = await getChatById(chatId);

  //create new chat title and a new chat record in db
  if (!existingChat) {
    const chatTitle = await generateTitleFromUserMessage(
      lastMessage.content as string
    );

    //create new chat
    await db.chat.create({
      data: {
        id: chatId,
        userId: user.id,
        title: chatTitle,
      },
    });
  }

  // Save user message to database
  const userMessage = await db.message.create({
    data: {
      id: lastMessage.id,
      role: "USER",
      chatId,
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
                chatId,
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
