import { motion } from "framer-motion";
import { FiAward, FiTrendingUp, FiStar, FiUsers } from "react-icons/fi";

const stats = [
  { value: "130+", label: "Problems Solved" },
  { value: "Top 5%", label: "NPTEL" },
  { value: "996", label: "CodeChef Rating" },
  { value: "National", label: "Hackathon Participant" }
];

const achievements = [
  {
    title: "NPTEL Top 5%",
    description: "Top 5% in DSA using Java.",
    icon: FiAward
  },
  {
    title: "HackerRank Badges",
    description: "C++ Gold, C Silver, Java Bronze, Problem Solving Bronze.",
    icon: FiStar
  },
  {
    title: "Hackamind 2026",
    description: "National Hackathon at Nirma University.",
    icon: FiUsers
  },
  {
    title: "CodeChef Rating",
    description: "Current 996, peak 1020 rating.",
    icon: FiTrendingUp
  }
];

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Premium 3D tilt handlers
const handleMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  const rotateY = ((x - xc) / xc) * 8; // max 8 deg
  const rotateX = -((y - yc) / yc) * 8; // max 8 deg
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  card.style.boxShadow = "0 15px 25px rgba(59, 130, 246, 0.18)";
};

const handleMouseLeave = (e) => {
  const card = e.currentTarget;
  card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  card.style.boxShadow = "";
};

function StatCard({ value, label }) {
  return (
    <motion.div
      variants={item}
      className="glass rounded-2xl p-5 text-center border border-slate-200/60 dark:border-white/10 shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all duration-300 ease-out cursor-pointer"
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-sans"
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        viewport={{ once: true }}
      >
        {value}
      </motion.div>
      <div className="mt-1 text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold font-sans">
        {label}
      </div>
    </motion.div>
  );
}

function AchievementCard({ title, description, icon: Icon }) {
  return (
    <motion.div
      variants={item}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all duration-300 ease-out cursor-pointer group"
      whileHover="hovered"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
          variants={{
            hovered: { rotate: 360, scale: 1.15, backgroundColor: "rgba(59,130,246,0.2)" }
          }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
        >
          <Icon className="text-lg" />
        </motion.div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white font-sans group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70 font-sans">
            {description}
          </p>
        </div>
      </div>
      <motion.div
        className="mt-4 h-[2px] w-12 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300"
        variants={{
          hovered: { width: "100%" }
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export default function Achievements() {
  return (
    <section id="achievements" className="section-padding bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] text-blue-600 dark:text-blue-400">
            Milestones & Accomplishments
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Achievements
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        <motion.div
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {achievements.map((ach) => (
            <AchievementCard key={ach.title} {...ach} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
