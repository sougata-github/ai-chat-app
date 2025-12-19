https://useworkflow.dev/docs/getting-started/next
https://useworkflow.dev/docs/ai/resumable-streams
https://useworkflow.dev/docs/ai

app/api/chat/[id]/stream/route.ts

```ts
import { createUIMessageStreamResponse } from "ai";
import { getRun } from "workflow/api";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  // Client provides the last chunk index they received
  const startIndexParam = searchParams.get("startIndex");
  const startIndex = startIndexParam
    ? parseInt(startIndexParam, 10)
    : undefined;
  // Instead of starting a new run, we fetch an existing run.
  const run = getRun(id);
  const stream = run.getReadable({ startIndex });
  return createUIMessageStreamResponse({ stream });
}
```

The startIndex parameter ensures the client can choose where to resume the stream from. For instance, if the function times out during streaming, the chat transport will use startIndex to resume the stream exactly from the last token it received.

Use WorkflowChatTransport in the Client
Replace the default transport in AI-SDK's useChat with WorkflowChatTransport, and update the callbacks to store and use the latest run ID. For now, we'll store the run ID in localStorage. For your own app, this would be stored wherever you store session information.

app/page.tsx

```tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@workflow/ai";
import { useMemo, useState } from "react";
export default function ChatPage() {
  // Check for an active workflow run on mount
  const activeRunId = useMemo(() => {
    if (typeof window === "undefined") return;
    return localStorage.getItem("active-workflow-run-id") ?? undefined;
  }, []);
  const { messages, sendMessage, status } = useChat({
    resume: Boolean(activeRunId),
    transport: new WorkflowChatTransport({
      api: "/api/chat",
      // Store the run ID when a new chat starts
      onChatSendMessage: (response) => {
        const workflowRunId = response.headers.get("x-workflow-run-id");
        if (workflowRunId) {
          localStorage.setItem("active-workflow-run-id", workflowRunId);
        }
      },
      // Clear the run ID when the chat completes
      onChatEnd: () => {
        localStorage.removeItem("active-workflow-run-id");
      },
      // Use the stored run ID for reconnection
      prepareReconnectToStreamRequest: ({ api, ...rest }) => {
        const runId = localStorage.getItem("active-workflow-run-id");
        if (!runId) throw new Error("No active workflow run ID found");
        return {
          ...rest,
          api: `/api/chat/${encodeURIComponent(runId)}/stream`,
        };
      },
    }),
  });
  // ... render your chat UI
}
```
