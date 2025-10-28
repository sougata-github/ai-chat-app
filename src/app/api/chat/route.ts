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

  const streamId = uuidv4();
  await fetchMutation(api.streams.appendStreamId, { chatId, streamId });

  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  const token = await getToken(createAuth);

  if (!token) {
    return new Response("Unautorized", { status: 401 });
  }

  const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });

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

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  const previousMessages = await fetchQuery(api.chats.getMessagesByChatId, {
    chatId,
  });

  const uiMessages =
    trigger === "regenerate-message"
      ? convertConvexMessagesToAISDK(previousMessages)
      : [...convertConvexMessagesToAISDK(previousMessages), message];

  let existingChat = await fetchQuery(
    api.chats.getChatByUUID,
    { chatId },
    { token }
  );

  if (!existingChat) {
    await fetchMutation(
      api.chats.createChat,
      { id: chatId, title: "New Chat" },
      { token }
    );
    existingChat = await fetchQuery(
      api.chats.getChatByUUID,
      { chatId },
      { token }
    );
  }

  if (
    existingChat?.title.trim() === "New Chat" &&
    previousMessages.length <= 2 &&
    trigger !== "regenerate-message"
  ) {
    const userPrompt = (message as UIMessage).parts.find(
      (part) => part.type === "text"
    )?.text;

    if (userPrompt) {
      const updatedTitle = await generateTitleFromUserMessage(userPrompt);

      await fetchMutation(
        api.chats.updateChatTitle,
        { chatId, title: updatedTitle.split(" ").slice(0, 4).join(" ") },
        { token }
      );
    }
  }

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
        },
        toolChoice: "auto",
        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream({
          delayInMs: 2,
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
        await fetchMutation(
          api.chats.updateChatStatus,
          { chatId, status: "ready" },
          { token }
        );

        const assistantMessages = messages.filter(
          (message) => message.role === "assistant"
        );

        const lastAssistantMessage = assistantMessages.at(-1);

        if (!lastAssistantMessage) {
          console.warn("No assistant message found in response.");
          return;
        }

        // const hasToolResults = lastAssistantMessage.parts?.some(
        //   (part) =>
        //     part.type === "tool-generateImageTool" &&
        //     part.state === "output-available"
        // );

        // let imageUrl: string | undefined = undefined;
        // let imageKey: string | undefined = undefined;

        // if (hasToolResults) {
        //   for (const part of lastAssistantMessage.parts ?? []) {
        //     if (
        //       part.type === "tool-generateImageTool" &&
        //       part.state === "output-available"
        //     ) {
        //       const { output } = part;
        //       const result = output as InferUITool<
        //         typeof generateImageTool
        //       >["output"];
        //       imageUrl = result.imageUrl!;
        //       imageKey = result.imageKey!;
        //       break;
        //     }
        //   }
        // }
        await fetchMutation(
          api.chats.createMessage,
          {
            id: uuidv4(),
            role: "AI",
            chatId,
            parts: lastAssistantMessage.parts ?? [],
          },
          { token }
        );

        const hasToolCalls =
          lastAssistantMessage.parts?.some((part) =>
            part.type.startsWith("tool-")
          ) || false;

        const cost = hasToolCalls ? 5 : 1;

        //update user usage
        await fetchMutation(
          api.user.updateUser,
          {
            cost,
          },
          { token }
        );
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
