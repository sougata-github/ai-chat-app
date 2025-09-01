import { createUIMessageStream, JsonToSseTransformStream, UIMessage } from "ai";
import { convertConvexMessagesToAISDK } from "@/lib/utils";
import { getToken } from "@convex-dev/better-auth/nextjs";
import { differenceInSeconds } from "date-fns";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { createAuth } from "@/lib/auth";

import { getStreamContext } from "../../route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { id: chatId } = await params;

  if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  const token = await getToken(createAuth);

  if (!token) {
    return new Response("Unautorized", { status: 401 });
  }

  const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  const chat = await fetchQuery(api.chats.getChatByUUID, { chatId });

  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  const streamIds = await fetchQuery(api.streams.loadStreams, { chatId });

  if (!streamIds.length) {
    return new Response("No streams found", { status: 404 });
  }

  const latestStreamId = streamIds.at(-1);
  if (!latestStreamId) {
    return new Response("No recent stream found", { status: 404 });
  }

  const emptyStream = createUIMessageStream<UIMessage>({
    execute: () => {},
  });

  let resumable;
  try {
    resumable = await streamContext.resumableStream(latestStreamId, () =>
      emptyStream.pipeThrough(new JsonToSseTransformStream())
    );
  } catch (error) {
    console.error("Error resuming stream:", error);
    return new Response(emptyStream, { status: 200 });
  }

  if (resumable) {
    return new Response(resumable, { status: 200 });
  }

  // If stream already finished, try sending the assistant's last message
  const dbMessages = await fetchQuery(api.chats.getMessagesByChatId, {
    chatId,
  });

  const messages = convertConvexMessagesToAISDK(dbMessages);

  const mostRecent = messages.at(-1);

  if (!mostRecent || mostRecent.role !== "assistant") {
    return new Response(emptyStream, { status: 200 });
  }

  const mostRecentDBMessage = dbMessages.at(-1);

  const messageCreatedAt = new Date(mostRecentDBMessage!.createdAt);

  if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
    return new Response(emptyStream, { status: 200 });
  }

  const streamWithMessage = createUIMessageStream<UIMessage>({
    execute({ writer }) {
      writer.write({
        type: "data-appendMessage",
        data: JSON.stringify(mostRecent),
        transient: true,
      });
    },
  });

  return new Response(
    streamWithMessage.pipeThrough(new JsonToSseTransformStream()),
    { status: 200 }
  );
}
