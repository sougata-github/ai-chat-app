import {
  appendStreamId,
  generateTitleFromUserMessage,
  getChatById,
  loadStreams,
} from "@/lib/chat";
import {
  createModelInstance,
  DEFAULT_MODEL_ID,
  isValidModelId,
  ModelId,
} from "@/lib/model/model";
import { createResumableStreamContext } from "resumable-stream";
import { streamText, Message, smoothStream } from "ai";
import { getMessagesByChatId } from "@/lib/chat";
import { SYSTEM_PROMPT } from "@/constants";
import { extractText } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { createDataStream } from "ai";
import { v4 as uuidv4 } from "uuid";
import { after } from "next/server";
import { db } from "@/db";

const streamContext = createResumableStreamContext({
  waitUntil: after,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  const streamIds = await loadStreams(chatId);
  if (!streamIds.length) {
    return new Response("No streams found", { status: 404 });
  }

  const latestStreamId = streamIds.at(-1);
  if (!latestStreamId) {
    return new Response("No recent stream found", { status: 404 });
  }

  const emptyStream = createDataStream({
    execute: () => {},
  });

  const resumable = await streamContext.resumableStream(
    latestStreamId,
    () => emptyStream
  );

  if (resumable) {
    return new Response(resumable, { status: 200 });
  }

  // If stream already finished, try sending the assistant's last message
  const messages = await getMessagesByChatId(chatId);
  const mostRecent = messages.at(-1);

  if (!mostRecent || mostRecent.role !== "AI") {
    return new Response(emptyStream, { status: 200 });
  }

  const streamWithMessage = createDataStream({
    execute(buffer) {
      buffer.writeData({
        type: "append-message",
        message: JSON.stringify(mostRecent),
      });
    },
  });

  return new Response(streamWithMessage, { status: 200 });
}

export async function POST(req: Request) {
  const { messages, id: chatId, model: requestedModel } = await req.json();

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

  const lastMessage = messages[messages.length - 1];

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  let selectedModel: ModelId = DEFAULT_MODEL_ID;
  if (requestedModel && isValidModelId(requestedModel)) {
    selectedModel = requestedModel;
  } else if (requestedModel) {
    console.warn(
      `Invalid model requested: ${requestedModel}, falling back to ${DEFAULT_MODEL_ID}`
    );
  }

  const modelInstance = createModelInstance(selectedModel);

  if (
    !lastMessage ||
    typeof lastMessage.content !== "string" ||
    !lastMessage.content.trim()
  ) {
    return new Response("Invalid last message", { status: 400 });
  }

  const existingChat = await getChatById(chatId);

  if (!existingChat) {
    const chatTitle = await generateTitleFromUserMessage(lastMessage.content);

    await db.chat.create({
      data: {
        id: chatId,
        userId: user.id,
        title: chatTitle,
      },
    });
  }

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

  const coreMessages = messages.map((msg: Message) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

  //resumable stream setup
  const streamId = uuidv4();
  await appendStreamId({ chatId, streamId });

  const stream = createDataStream({
    execute: (dataStream) => {
      const result = streamText({
        model: modelInstance,
        system: SYSTEM_PROMPT,
        messages: coreMessages,
        experimental_transform: smoothStream({ chunking: "word" }),
        async onFinish({ response }) {
          const aiMessage = response.messages[0];
          if (aiMessage) {
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
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });

  return new Response(
    await streamContext.resumableStream(streamId, () => stream)
  );
}
