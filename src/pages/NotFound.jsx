import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 space-y-6 max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Warning Icon with pulse effect */}
        <motion.div 
          className="mx-auto inline-flex items-center justify-center p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FiAlertTriangle className="text-4xl sm:text-5xl" />
        </motion.div>

        {/* 404 Title */}
        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          404
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-white/60 text-sm sm:text-base">
            Oops! The page you are looking for doesn't exist or has been moved to another URL.
          </p>
        </div>

        {/* Return Button */}
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition duration-300 hover:scale-[1.02]"
          >
            <FiHome className="text-lg" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
