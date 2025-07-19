"use client";
import { motion } from "framer-motion";
import { SpinnerIcon } from "./SpinnerIcon";

const Thinking = () => {
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
      <div className="animate-spin">
        <SpinnerIcon size={16} />
      </div>
    </motion.div>
  );
};

export default Thinking;
