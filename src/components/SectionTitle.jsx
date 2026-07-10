import { motion } from "framer-motion";

export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-10 sm:mb-12 text-center">
      <motion.p
        className="text-xs sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] text-blue-400 dark:text-blue-400"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {subtitle}
      </motion.p>
      <motion.h2
        className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        {title}
      </motion.h2>
    </div>
  );
}
