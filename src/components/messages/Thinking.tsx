"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Thinking = ({
  size,
  className,
}: {
  size: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "size-3",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <motion.div
      className="relative flex items-center space-x-2 text-muted-foreground"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut",
          delay: 0.1, // Small delay prevents flash on quick responses
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.15 },
      }}
    >
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="bg-foreground border-none absolute inset-0 animate-[pulse-dot_1.5s_ease-in-out_infinite] rounded-full border-2" />
        <span className="sr-only">Loading</span>
      </div>
    </motion.div>
  );
};

export default Thinking;
