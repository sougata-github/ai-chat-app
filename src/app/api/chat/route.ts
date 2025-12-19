import {
  streamText,
  createUIMessageStream,
  JsonToSseTransformStream,
  convertToModelMessages,
  stepCountIs,
  UIMessage,
  smoothStream,
} from "ai";
import {
  getModelForTool,
  getWeatherTool,
  isValidTool,
  Tool,
  webSearchTool,
  marketResearchTool,
} from "@/lib/tools/tool";
import {
  createModelInstance,
  DEFAULT_MODEL_ID,
  isValidModelId,
  ModelId,
} from "@/lib/model/model";
import {
  createResumableStreamContext,
  ResumableStreamContext,
} from "resumable-stream";
import { convertConvexMessagesToAISDK, injectCurrentDate } from "@/lib/utils";
import { LIMITS, REASONING_SYSTEM_PROMPT, SYSTEM_PROMPT } from "@/constants";
import { getToken } from "@convex-dev/better-auth/nextjs";
import { generateTitleFromUserMessage } from "@/lib/chat";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { getChatModelFromCookies } from "@/lib/model";
import { getToolFromCookies } from "@/lib/tools";
import { api } from "@convex/_generated/api";
import { createAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { after } from "next/server";

export const maxDuration = 100;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext(): ResumableStreamContext | null {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({ waitUntil: after });
    } catch (error) {
      if ((error as Error).message.includes("REDIS_URL")) {
        console.log("Resumable streams are disabled due to missing REDIS_URL");
      } else {
        console.error(error);
      }
    }
  }
  return globalStreamContext;
}

export async function POST(req: Request) {
  const {
    message,
    id: chatId,
    timezone = "Asia/Kolkata",
    trigger,
  } = await req.json();

  // Early validation
  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  const streamId = uuidv4();

  // Parallelize independent operations
  const [token, selectedTool, selectedModel] = await Promise.all([
    getToken(createAuth),
    getToolFromCookies(),
    getChatModelFromCookies(),
  ]);

  if (!token) {
    return new Response("Unautorized", { status: 401 });
  }

  // Parallelize user and chat queries
  const [user, previousMessages, existingChat] = await Promise.all([
    fetchQuery(api.auth.getCurrentUser, {}, { token }),
    fetchQuery(api.chats.getMessagesByChatId, { chatId }),
    fetchQuery(api.chats.getChatByUUID, { chatId }, { token }),
  ]);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tier = user.emailVerified ? "verified" : "guest";
  const limit = LIMITS[tier];
  const currentCount = user.messageCount ?? 0;

  if (currentCount >= limit) {
    console.warn("Rate limit exceeded for user", user._id);
    return new Response("Too Many Requests", { status: 429 });
  }

  // Create chat if it doesn't exist (non-blocking)
  if (!existingChat) {
    void fetchMutation(
      api.chats.createChat,
      { id: chatId, title: "New Chat" },
      { token }
    );
  }

  // Prepare messages and start stream immediately
  const uiMessages = convertConvexMessagesToAISDK(previousMessages);

  // Generate title in background (non-blocking)
  if (
    existingChat?.title.trim() === "New Chat" &&
    previousMessages.length <= 2 &&
    trigger !== "regenerate-message"
  ) {
    const userPrompt = (message as UIMessage).parts.find(
      (part) => part.type === "text"
    )?.text;

    if (userPrompt) {
      // Don't await - run in background
      generateTitleFromUserMessage(userPrompt)
        .then((updatedTitle) => {
          return fetchMutation(
            api.chats.updateChatTitle,
            { chatId, title: updatedTitle.split(" ").slice(0, 4).join(" ") },
            { token }
          );
        })
        .catch((error) => {
          console.error("Failed to generate title:", error);
        });
    }
  }

  // Append stream ID (non-blocking)
  void fetchMutation(api.streams.appendStreamId, { chatId, streamId });

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
          getWeatherTool,
          webSearchTool,
          marketResearchTool,
        },
        toolChoice: "auto",
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream({
          delayInMs: 0.5,
          chunking: "word",
        }),
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
    onFinish: async ({ messages }) => {
      try {
        const assistantMessages = messages.filter(
          (message) => message.role === "assistant"
        );

        const lastAssistantMessage = assistantMessages.at(-1);

        if (!lastAssistantMessage) {
          console.warn("No assistant message found in response.");
          return;
        }

        const hasToolCalls =
          lastAssistantMessage.parts?.some((part) =>
            part.type.startsWith("tool-")
          ) || false;

        const cost = hasToolCalls ? 5 : 1;

        // Parallelize mutations for faster completion
        await Promise.all([
          fetchMutation(
            api.chats.updateChatStatus,
            { chatId, status: "ready" },
            { token }
          ),
          fetchMutation(
            api.chats.createMessage,
            {
              id: uuidv4(),
              role: "AI",
              chatId,
              parts: lastAssistantMessage.parts ?? [],
            },
            { token }
          ),
          fetchMutation(api.user.updateUser, { cost }, { token }),
        ]);
      } catch (error) {
        console.log("Failed to save response in DB", (error as Error).message);
      }
    },
    onError: (error) => {
      void fetchMutation(
        api.chats.updateChatStatus,
        { chatId, status: "ready" },
        { token }
      );
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
