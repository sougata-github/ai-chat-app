import { DefaultChatTransport } from "ai";

export const createResumableTransport = ({
  messageId,
  setChatId,
  setMessageId,
}: {
  messageId: string | null;
  setChatId: (id: string | null) => any;
  setMessageId: (id: string | null) => any;
}) =>
  new DefaultChatTransport({
    async prepareSendMessagesRequest({ messages, id }) {
      await setChatId(id);
      return { body: { message: messages[messages.length - 1], id } };
    },
    prepareReconnectToStreamRequest: (data) => {
      return {
        ...data,
        headers: { ...data.headers, "x-is-reconnect": "true" },
      };
    },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);

      if (headers.get("x-is-reconnect") === "true") {
        return fetch(input + `?id=${messageId}`, {
          ...init,
          method: "GET",
        });
      }

      const { id } = JSON.parse(init?.body as string).message;
      await setMessageId(id);

      const [res] = await Promise.all([
        // 👇 subscribe to stream
        fetch(input + `?id=${id}`, { method: "GET" }),

        // 👇 trigger workflow
        fetch(input, init),
      ]);

      return res;
    },
  });
