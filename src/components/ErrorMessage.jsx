import { motion } from "framer-motion";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/30 dark:border-red-500/20 shadow-[0_8px_32px_rgba(239,68,68,0.08)] max-w-xl mx-auto my-8 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Warning/Error Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h4 className="text-lg font-semibold text-red-800 dark:text-red-400 font-sans">
        Failed to Load Repositories
      </h4>
      
      <p className="mt-2 text-sm text-red-700/80 dark:text-red-300/80 break-words max-w-md font-sans">
        {message || "An unexpected error occurred while fetching repositories from GitHub."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-red-600 text-white dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 transition duration-300 shadow-md hover:shadow-[0_0_18px_rgba(239,68,68,0.4)] cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4 animate-spin-hover"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Retry Fetching
        </button>
      )}
    </motion.div>
  );
}
