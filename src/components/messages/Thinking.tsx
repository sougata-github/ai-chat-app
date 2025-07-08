"use client";
import { Loader } from "lucide-react";

const Thinking = () => {
  return (
    <div className="flex w-fit space-x-2 mt-2">
      <Loader className="animate-spin transition size-4" />
    </div>
  );
};

export default Thinking;
