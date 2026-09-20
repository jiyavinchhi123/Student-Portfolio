import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function EditModal({ isOpen, onClose, title, children, onSave }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121215] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold tracking-wide">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                {children}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-white/5 pt-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full text-xs font-semibold border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
