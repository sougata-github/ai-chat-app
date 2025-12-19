import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { UIMessageChunk } from "ai";
import z from "zod/v4";
import { redis } from "./redis";

// 👇 the event we're gonna emit in real-time later
// the AI SDK v5 doesn't provide a chunk zod schema, so we'll go with `z.any()`
export const schema = {
  ai: { chunk: z.any() as z.ZodType<UIMessageChunk> },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
