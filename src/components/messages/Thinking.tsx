"use client";
import { cn } from "@/lib/utils";

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
    <div className="flex w-full justify-start pt-4 pl-4 animate-in fade-in duration-150">
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="bg-foreground absolute inset-0 animate-[pulse-dot_1.5s_ease-in-out_infinite] rounded-full" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};

export default Thinking;
