"use server";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const uploadTextFile = async (textFile: File) => {
  return await utapi.uploadFiles([textFile]);
};

export const deletedAttachedFile = async (fileKey: string) => {
  await utapi.deleteFiles(fileKey);
};
