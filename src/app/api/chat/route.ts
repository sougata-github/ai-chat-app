import {
  generateImageTool,
  getModelForMode,
  isValidToolMode,
  ToolMode,
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
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { streamText, Message, smoothStream, appendResponseMessages } from "ai";
import { getMessagesByChatId } from "@/lib/chat";
import { SYSTEM_PROMPT } from "@/constants";
import { extractText } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { createDataStream } from "ai";
import { v4 as uuidv4 } from "uuid";
import { after } from "next/server";
import { db } from "@/db";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({ waitUntil: after });
    } catch (err) {
      console.warn("Resumable stream disabled", err);
    }
  }
  return globalStreamContext;
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
    messages,
    id: chatId,
    model: requestedModel,
    mode: requestedMode,
  } = await req.json();

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

  // handle tool mode
  let toolMode: ToolMode = "text";

  if (requestedMode && isValidToolMode(requestedMode)) {
    toolMode = requestedMode;
  }

  // get appropriate model
  let selectedModel: ModelId = DEFAULT_MODEL_ID;
  if (requestedModel && isValidModelId(requestedModel)) {
    selectedModel = requestedModel;
  }

  // override model if tool mode requires specific model
  const finalModel = getModelForMode(toolMode, selectedModel);
  const modelInstance = createModelInstance(finalModel);

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
      parts: lastMessage.parts,
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
        experimental_activeTools:
          toolMode === "image-gen"
            ? ["generateImageTool"]
            : toolMode === "web-search"
            ? ["webSearchTool"]
            : [],
        tools: {
          generateImageTool,
          webSearchTool,
        },
        toolCallStreaming: true,
        maxSteps: 5,
        experimental_transform: smoothStream({ chunking: "word" }),
        onStepFinish: async ({
          toolResults,
          toolCalls,
          response,
          stepType,
          finishReason,
        }) => {
          if (toolMode === "text") return;

          console.log("On step finish called...");
          console.log("Step Type: ", stepType);
          console.log("Finish Reason: ", finishReason);

          if (!toolResults || toolResults.length === 0) return;

          const toolName = toolCalls[0]?.toolName;

          console.log(`${toolCalls[0].toolName} called`);

          const assistantMessages = appendResponseMessages({
            messages,
            responseMessages: response.messages,
          }).filter((message) => message.role === "assistant");

          const lastAssistantMessage = assistantMessages.at(-1);

          if (lastAssistantMessage) {
            //extract image key and url
            if (toolName === "generateImageTool") {
              const imageResult = toolResults.find(
                (
                  res
                ): res is typeof res & {
                  result: { imageUrl: string; imageKey: string };
                } =>
                  res.toolName === "generateImageTool" &&
                  typeof res.result === "object" &&
                  !Array.isArray(res.result) &&
                  res.result !== null &&
                  "imageUrl" in res.result &&
                  "imageKey" in res.result
              );

              const imageUrl = imageResult?.result.imageUrl;
              const imageKey = imageResult?.result.imageKey;

              console.log("Saving image-response to DB...");

              //create ai response
              await db.message.create({
                data: {
                  id: uuidv4(),
                  role: "AI",
                  chatId,
                  userId: user.id,
                  content: "",
                  parts: JSON.parse(
                    JSON.stringify(lastAssistantMessage.parts ?? [])
                  ),
                  imageKey,
                  imageUrl,
                  promptId: userMessage.id,
                  createdAt: new Date(),
                },
              });

              console.log("Image Response saved to DB");
            }

            if (toolName === "webSearchTool") {
              console.log("Saving web-search result to DB...");

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
                  imageKey: null,
                  imageUrl: null,
                  promptId: userMessage.id,
                  createdAt: new Date(),
                },
              });

              console.log("Web Search result saved to DB.");
            }
          }
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

            //for tool calls messages will be created before-hand in on StepFinish
            const existingMessage = await db.message.findFirst({
              where: { promptId: userMessage.id },
            });

            if (!existingMessage) {
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
                  promptId: userMessage.id,
                  createdAt: new Date(),
                },
              });
            } else {
              await db.message.update({
                where: {
                  id: existingMessage.id,
                },
                data: {
                  userId: user.id,
                  content: extractText(lastAssistantMessage.content),
                  parts: JSON.parse(
                    JSON.stringify(lastAssistantMessage.parts ?? [])
                  ),
                  promptId: userMessage.id,
                },
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

      result.consumeStream();
      result.mergeIntoDataStream(dataStream);
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
