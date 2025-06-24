"use client";
import { motion } from "framer-motion";

const Thinking = () => {
  return (
    <div className="flex w-fit space-x-2 mt-2">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="size-2 rounded-full bg-muted-foreground/60"
          initial={{ y: 0 }}
          whileInView={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: dot * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default Thinking;
