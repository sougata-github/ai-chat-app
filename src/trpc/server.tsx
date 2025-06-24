import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// Get a stable query client per request
export const getQueryClient = cache(makeQueryClient);

// Create a stable server-side tRPC caller per request
export const getServerCaller = cache(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const req = new Request(baseUrl, {
    headers: new Headers(),
  });

  const resHeaders = new Headers();
  const ctx = await createTRPCContext({ req, resHeaders });

  return createCallerFactory(appRouter)(ctx);
});

// Hydration helpers using server-side caller
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  await getServerCaller(),
  getQueryClient
);
