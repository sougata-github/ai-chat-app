import "server-only"; // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/* IMPORTANT: Create a stable getter for the query client that
             will return the same client during the same request.*/
export const getQueryClient = cache(makeQueryClient);

const caller = await (async () => {
  const req = new Request("http://localhost", {
    headers: await headers(),
  });
  const resHeaders = new Headers();
  const ctx = await createTRPCContext({ req, resHeaders });
  return createCallerFactory(appRouter)(ctx);
})();

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
