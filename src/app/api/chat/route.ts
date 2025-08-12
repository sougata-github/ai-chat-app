import {
  streamText,
  smoothStream,
  UIMessage,
  createUIMessageStream,
  JsonToSseTransformStream,
  convertToModelMessages,
  stepCountIs,
  InferUITool,
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
  createModelInstance,
  DEFAULT_MODEL_ID,
  isValidModelId,
  ModelId,
} from "@/lib/model/model";
import {
  appendStreamId,
  generateTitleFromUserMessage,
  getChatById,
} from "@/lib/chat";
import { convertToAISDKMessages, injectCurrentDate } from "@/lib/utils";
import { REASONING_SYSTEM_PROMPT, SYSTEM_PROMPT } from "@/constants";
import { createResumableStreamContext } from "resumable-stream";
import { getChatModelFromCookies } from "@/lib/model";
import { getToolFromCookies } from "@/lib/tools";
import { getMessagesByChatId } from "@/lib/chat";
import { v4 as uuid } from "@lukeed/uuid";
import { auth } from "@/lib/auth/auth";
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

export async function POST(req: Request) {
  const {
    message,
    id: chatId,
    timezone = "Asia/Kolkata",
    trigger,
    messageId,
  } = await req.json();

  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { user } = session;

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  let promptId = "";

  //when regenerating messages
  if (trigger === "regenerate-message") {
    promptId = messageId;

    if (!messageId)
      return new Response("Message ID is required for regeneration", {
        status: 400,
      });

    //message to regenerate
    const messageToRegenerate = await db.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!messageToRegenerate || messageToRegenerate.role !== "USER") {
      return new Response("Invalid message for regeneration", { status: 400 });
    }

    //delete all messages after this user message
    await db.message.deleteMany({
      where: {
        chatId,
        createdAt: {
          gt: messageToRegenerate.createdAt,
        },
      },
    });
  }

  const existingChat = await getChatById(chatId);

  if (!existingChat) {
    const messageContent = (message as UIMessage).parts.find(
      (part) => part.type === "text"
    )?.text;

    console.log(messageContent);

    const chatTitle = await generateTitleFromUserMessage(
      messageContent ?? "Untitled"
    );

    await db.chat.create({
      data: {
        id: chatId,
        userId: user.id,
        title: chatTitle,
      },
    });
  }

  //create user message when submitting a message
  if (trigger === "submit-message") {
    const createUserMessage = async () => {
      try {
        //extract file parts if present
        let attachmentId: string | null = null;

        const fileAttachment = (message as UIMessage).parts?.find(
          (part) => part.type === "file"
        );

        if (
          fileAttachment &&
          fileAttachment.filename &&
          fileAttachment.url &&
          fileAttachment.type
        ) {
          const attachment = await db.attachment.create({
            data: {
              messageId: message.id,
              url: fileAttachment.url,
              name: fileAttachment.filename,
              type: fileAttachment.mediaType,
              key: message.metadata?.fileKey,
            },
          });
          attachmentId = attachment.id;
        }

        const userMessage = await db.message.create({
          data: {
            id: message.id,
            role: "USER",
            chatId,
            userId: user.id,
            attachmentId,
            parts: message.parts,
            createdAt: message.createdAt || new Date(),
          },
        });

        return userMessage;
      } catch (error) {
        console.log("Failed to create user message ", error);
      }
    };

    const userMessage = await createUserMessage();

    if (!userMessage)
      return new Response("Failed to create user message", { status: 500 });

    promptId = userMessage.id;
  }

  const previousMessages = await getMessagesByChatId(chatId);
  const uiMessages =
    trigger === "regenerate-message"
      ? convertToAISDKMessages(previousMessages)
      : [...convertToAISDKMessages(previousMessages), message];

  let tool: Tool = "none";

  if (selectedTool && isValidTool(selectedTool)) {
    tool = selectedTool;
  }

  let model: ModelId = DEFAULT_MODEL_ID;
  if (selectedModel && isValidModelId(selectedModel)) {
    model = selectedModel;
  }

  const finalModel = getModelForTool(tool, model);
  const modelInstance = createModelInstance(finalModel);

  const streamId = uuid();
  await appendStreamId({ chatId, streamId });

  const finalSystemPrompt =
    tool === "reasoning"
      ? injectCurrentDate(REASONING_SYSTEM_PROMPT, timezone)
      : injectCurrentDate(SYSTEM_PROMPT, timezone);

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: modelInstance,
        system: finalSystemPrompt,
        messages: convertToModelMessages(uiMessages),
        tools: {
          generateImageTool,
          getWeatherTool,
          webSearchTool,
        },
        toolChoice: "auto",
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream({ chunking: "word" }),
      });

      result.consumeStream();

      if (tool === "reasoning") {
        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      } else {
        dataStream.merge(result.toUIMessageStream());
      }
    },
    async onFinish({ messages }) {
      try {
        const assistantMessages = messages.filter(
          (message) => message.role === "assistant"
        );

        const lastAssistantMessage = assistantMessages.at(-1);

        if (!lastAssistantMessage) {
          console.warn("No assistant message found in response.");
          return;
        }

        const hasToolResults = lastAssistantMessage.parts?.some(
          (part) =>
            part.type === "tool-generateImageTool" &&
            part.state === "output-available"
        );

        let imageUrl: string | null = null;
        let imageKey: string | null = null;

        if (hasToolResults) {
          for (const part of lastAssistantMessage.parts ?? []) {
            if (
              part.type === "tool-generateImageTool" &&
              part.state === "output-available"
            ) {
              const { output } = part;
              const result = output as InferUITool<
                typeof generateImageTool
              >["output"];
              imageUrl = result.imageUrl!;
              imageKey = result.imageKey!;
              break;
            }
          }
        }

        const existingMessage = await db.message.findFirst({
          where: { promptId, role: "AI" },
        });

        if (!existingMessage) {
          try {
            await db.message.create({
              data: {
                role: "AI",
                chatId,
                userId: user.id,
                parts: JSON.parse(
                  JSON.stringify(lastAssistantMessage.parts ?? [])
                ),
                imageUrl,
                imageKey,
                promptId,
                createdAt: new Date(),
              },
            });
          } catch (error) {
            console.error("Error saving message to DB:", error);
          }
        }
      } catch (error) {
        console.error("Error in onFinish:", error);
      }
    },
    onError: (error) => {
      console.error("Stream error details:", error);
      return "An error occurred during stream";
    },
  });

  const streamContext = getStreamContext();
  if (streamContext) {
    try {
      const resumableStream = await streamContext.resumableStream(
        streamId,
        () => stream.pipeThrough(new JsonToSseTransformStream())
      );
      return new Response(resumableStream);
    } catch (error) {
      console.error("Error creating resumable stream:", error);
      return new Response(stream);
    }
  } else {
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  }
}
