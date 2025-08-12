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
      initial={{ y: 5, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        transition: {
          ease: "easeOut",
        },
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
