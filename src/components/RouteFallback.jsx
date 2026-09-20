import { motion } from "framer-motion";

export default function RouteFallback({ theme = "dark" }) {
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-[60vh] flex flex-col items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-slate-900"
      }`}
      role="status"
      aria-label="Loading page content"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing aura */}
        <motion.div
          className={`absolute h-20 w-20 rounded-full border-2 ${
            isDark
              ? "border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
              : "border-blue-500/20 shadow-[0_0_25px_rgba(37,99,235,0.2)]"
          }`}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />

        {/* Primary spinning gradient ring */}
        <motion.div
          className={`h-12 w-12 rounded-full border-2 border-t-transparent ${
            isDark
              ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              : "border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          }`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Status indicator with subtle pulse */}
      <motion.div
        className="mt-6 flex flex-col items-center space-y-1.5"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <span
          className={`text-sm font-medium tracking-wider uppercase font-mono ${
            isDark ? "text-cyan-400" : "text-blue-600"
          }`}
        >
          Loading View
        </span>
        <p
          className={`text-xs ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Fetching component chunk...
        </p>
      </motion.div>
    </div>
  );
}
