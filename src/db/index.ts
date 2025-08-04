/* eslint-disable no-var */
import { PrismaClient } from "@/generated/client";
 import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

const prisma = new PrismaClient().$extends(withAccelerate())

export { prisma};
