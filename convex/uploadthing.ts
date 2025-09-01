"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { UTApi } from "uploadthing/server";

export const deleteFiles = internalAction({
  args: {
    keys: v.array(v.string()),
  },
  handler: async (_ctx, { keys }) => {
    if (!keys.length) return { success: true, deleted: [] };

    try {
      const utapi = new UTApi({
        token: process.env.CONVEX_UPLOADTHING_TOKEN!,
      });
      await utapi.deleteFiles(keys);
      return { success: true, deleted: keys };
    } catch (error) {
      console.error("UploadThing cleanup failed:", error);
      return { success: false, error: (error as Error).message };
    }
  },
});
