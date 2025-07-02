import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "32MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("Upload complete for file", file);
    }
  ),
} satisfies FileRouter;
