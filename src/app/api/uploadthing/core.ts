import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@/lib/auth/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Image upload complete:", file.ufsUrl);
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        type: file.type,
      };
    }),

  fileUploader: f({
    "application/pdf": { maxFileSize: "4MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("File upload complete:", file.ufsUrl);
      console.log(file.type);
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
