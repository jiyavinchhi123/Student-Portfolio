import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <motion.div
          className="absolute h-16 w-16 rounded-full border-4 border-blue-400/20 dark:border-blue-500/10"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        {/* Spinning indicator */}
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent dark:border-cyan-400 dark:border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
      <motion.p
        className="mt-6 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 font-sans"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Loading repositories...
      </motion.p>
    </div>
  );
}
