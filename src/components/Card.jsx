import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  return (
    <motion.div
      className={`glass rounded-2xl p-4 sm:p-6 glow-border ${className}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
