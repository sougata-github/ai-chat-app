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

  // No Redis configured - return immediately
  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { id: chatId } = await params;

  if (!chatId) {
    return new Response(null, { status: 204 });
  }

  // Get stream IDs first - this is the cheapest check
  const streamIds = await fetchQuery(api.streams.loadStreams, { chatId });

  if (!streamIds.length) {
    // No streams ever created for this chat - return immediately
    return new Response(null, { status: 204 });
  }

  const latestStreamId = streamIds.at(-1);
  if (!latestStreamId) {
    return new Response(null, { status: 204 });
  }

  // Try to resume the existing stream from Redis
  let resumable;
  try {
    // Use resumeExistingStream - it only subscribes to an existing stream, doesn't create one
    // Returns: ReadableStream if active, null if done, undefined if not found
    resumable = await streamContext.resumeExistingStream(latestStreamId);
  } catch (error) {
    console.error("Error resuming stream:", error);
    return new Response(null, { status: 204 });
  }

  // If we got a resumable stream (active stream exists), return it
  if (resumable) {
    return new Response(resumable, { status: 200 });
  }

  // resumable is null (stream done) or undefined (stream not found)

  // Stream not in Redis (expired or completed) - check if we should send the last message
  // Only do this expensive check if the stream was recently created
  const dbMessages = await fetchQuery(api.chats.getMessagesByChatId, {
    chatId,
  });

  const messages = convertConvexMessagesToAISDK(dbMessages);
  const mostRecent = messages.at(-1);

  if (!mostRecent || mostRecent.role !== "assistant") {
    return new Response(null, { status: 204 });
  }

  const mostRecentDBMessage = dbMessages.at(-1);
  const messageCreatedAt = new Date(mostRecentDBMessage!.createdAt);

  // Only send the message if it was created within the last 15 seconds
  if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
    return new Response(null, { status: 204 });
  }

  // Send the recently completed message
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
