import { motion } from "framer-motion";

export default function Badge({ icon: Icon, label, color }) {
  return (
    <div
      className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all duration-300"
      style={{ background: color }}
    >
      {Icon && <Icon className="text-lg" />}
      <span>{label}</span>
    </div>
  );
}
