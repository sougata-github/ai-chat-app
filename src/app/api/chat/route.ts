import {
  streamText,
  smoothStream,
  appendResponseMessages,
  wrapLanguageModel,
  extractReasoningMiddleware,
  appendClientMessage,
} from "ai";
import {
  generateImageTool,
  getModelForTool,
  getWeatherTool,
  isValidTool,
  Tool,
  webSearchTool,
} from "@/lib/tools/tool";
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
import { REASONING_SYSTEM_PROMPT, SYSTEM_PROMPT } from "@/constants";
import { convertToAISDKMessages, extractText } from "@/lib/utils";
import { createResumableStreamContext } from "resumable-stream";
import { getMessagesByChatId } from "@/lib/chat";
import { auth } from "@/lib/auth/auth";
import { createDataStream } from "ai";
import { v4 as uuidv4 } from "uuid";
import { after } from "next/server";
import { db } from "@/db";

export const maxDuration = 60;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (err) {
    console.warn("Resumable stream disabled", err);
    return null;
  }
}

export async function GET(req: Request) {
  const streamContext = getStreamContext();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

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
  const {
    message,
    id: chatId,
    model: requestedModel,
    tool: requestedTool,
  } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { user } = session;

  if (!message) {
    return new Response("No messages found", { status: 400 });
  }

  const previousMessages = await getMessagesByChatId(chatId);

  const messages = appendClientMessage({
    messages: convertToAISDKMessages(previousMessages),
    message,
  });

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  // handle tool mode
  let tool: Tool = "none";

  if (requestedTool && isValidTool(requestedTool)) {
    tool = requestedTool;
  }

  // get appropriate model
  let selectedModel: ModelId = DEFAULT_MODEL_ID;
  if (requestedModel && isValidModelId(requestedModel)) {
    selectedModel = requestedModel;
  }

  // override model if tool mode requires specific model
  const finalModel = getModelForTool(tool, selectedModel);
  let modelInstance = createModelInstance(finalModel);

  if (tool === "reasoning") {
    modelInstance = wrapLanguageModel({
      model: modelInstance,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });
  }

  if (
    !message ||
    typeof message.content !== "string" ||
    !message.content.trim()
  ) {
    return new Response("Invalid last message", { status: 400 });
  }

  const existingChat = await getChatById(chatId);

  if (!existingChat) {
    const chatTitle = await generateTitleFromUserMessage(message.content);

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
      id: message.id,
      role: "USER",
      chatId,
      userId: user.id,
      content: message.content,
      parts: message.parts,
      createdAt: message.createdAt || new Date(),
    },
  });

  //resumable stream setup
  const streamId = uuidv4();
  await appendStreamId({ chatId, streamId });

  const stream = createDataStream({
    execute: (dataStream) => {
      const result = streamText({
        model: modelInstance,
        system: tool === "reasoning" ? REASONING_SYSTEM_PROMPT : SYSTEM_PROMPT,
        messages,
        ...(tool !== "none" &&
          tool !== "reasoning" && {
            experimental_activeTools:
              tool === "image-gen"
                ? ["generateImageTool"]
                : tool === "web-search"
                ? ["webSearchTool"]
                : tool === "get-weather"
                ? ["getWeatherTool"]
                : [],
            tools: {
              generateImageTool,
              getWeatherTool,
              webSearchTool,
            },
          }),
        maxSteps: tool === "reasoning" ? 10 : 5,
        experimental_transform: smoothStream({ chunking: "word" }),
        onStepFinish: () => {
          if (tool === "none") return;
        },
        async onFinish({ response }) {
          try {
            const assistantMessages = appendResponseMessages({
              messages,
              responseMessages: response.messages,
            }).filter((message) => message.role === "assistant");

            const lastAssistantMessage = assistantMessages.at(-1);

            if (!lastAssistantMessage) {
              console.warn("No assistant message found in response.");
              return;
            }

            const hasToolResults = lastAssistantMessage.parts?.some(
              (part) =>
                part.type === "tool-invocation" &&
                part.toolInvocation.state === "result"
            );

            let imageUrl: string | null = null;
            let imageKey: string | null = null;

            if (hasToolResults) {
              for (const part of lastAssistantMessage.parts ?? []) {
                if (
                  part.type === "tool-invocation" &&
                  part.toolInvocation.toolName === "generateImageTool" &&
                  part.toolInvocation.state === "result"
                ) {
                  const result = part.toolInvocation.result;
                  if (
                    typeof result === "object" &&
                    result !== null &&
                    "imageUrl" in result &&
                    "imageKey" in result
                  ) {
                    imageUrl = result.imageUrl as string;
                    imageKey = result.imageKey as string;
                    break;
                  }
                }
              }
            }

            const existingMessage = await db.message.findFirst({
              where: { promptId: userMessage.id },
            });

            if (!existingMessage) {
              after(async () => {
                try {
                  console.log("Saving message to DB...");

                  await db.message.create({
                    data: {
                      id: uuidv4(),
                      role: "AI",
                      chatId,
                      userId: user.id,
                      content: extractText(lastAssistantMessage.content),
                      parts: JSON.parse(
                        JSON.stringify(lastAssistantMessage.parts ?? [])
                      ),
                      imageUrl,
                      imageKey,
                      promptId: userMessage.id,
                      createdAt: new Date(),
                    },
                  });

                  console.log("Message saved to DB");
                } catch (error) {
                  console.error("Error saving message to DB:", error);
                }
              });
            }
          } catch (error) {
            console.error("Error in onFinish:", error);
          }
        },

        onError: (error) => {
          console.error("Stream error details:", error);
        },
      });

      try {
        if (tool === "reasoning") {
          result.mergeIntoDataStream(dataStream, {
            sendReasoning: true,
          });
        } else {
          result.mergeIntoDataStream(dataStream);
        }
      } catch (err) {
        console.error("Failed to merge into data stream:", err);
      }
    },
  });

  const streamContext = getStreamContext();

  if (streamContext) {
    return new Response(
      await streamContext.resumableStream(streamId, () => stream)
    );
  } else {
    return new Response(stream);
  }
}
