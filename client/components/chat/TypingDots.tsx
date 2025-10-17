import { motion } from "framer-motion";

export default function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
