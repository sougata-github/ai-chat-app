"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SpinnerIcon } from "./SpinnerIcon";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type: "image" | "web-search" | "weather";
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
  if (type === "weather") {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.2,
          },
        }}
      >
        <div className="flex items-center gap-2 font-medium">
          <div className="animate-spin transition text-sm">
            <SpinnerIcon />
          </div>
          Getting the Weather
        </div>
      </motion.div>
    );
  }

  if (type === "image") {
    return (
      <div className="space-y-3 max-w-sm max-md:max-w-full">
        <div className="text-sm flex items-center gap-2">
          <div className="animate-spin transition">
            <SpinnerIcon />
          </div>
          Generating the Image
        </div>
        <Skeleton className="max-w-sm aspect-square rounded-lg" />
      </div>
    );
  }

  if (type === "web-search") {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.2,
          },
        }}
      >
        <div className="flex items-center gap-2 font-medium">
          <div className="animate-spin transition text-sm">
            <SpinnerIcon />
          </div>
          Searching the web
        </div>
      </motion.div>
    );
  }

  return null;
};

export default LoadingSkeleton;
