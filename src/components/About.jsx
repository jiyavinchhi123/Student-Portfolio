import { motion } from "framer-motion";
import profile from "../assets/Profile.jpeg";
import SectionTitle from "./SectionTitle";

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 18 }
    }
  };

  return (
    <section id="about" className="section-padding overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle title="About Me" subtitle="Who I Am" />

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-10 items-center">

          {/* Avatar Area with Rotating Glow */}
          <motion.div
            className="flex justify-center md:order-2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative group">
              {/* Rotating background glow blob */}
              <motion.div
                className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/25 to-indigo-600/15 blur-2xl pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <img
                src={profile}
                alt="Jiya Vinchhi"
                className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80 rounded-full border border-slate-200/50 dark:border-white/10 object-cover shadow-glow transition-all duration-500 hover:scale-[1.03]"
              />
            </div>
          </motion.div>

          {/* Text Area Staggered Loading */}
          <motion.div
            className="grid gap-6 md:order-1"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div className="space-y-4" variants={textVariants}>
              <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-white/80 leading-relaxed font-sans">
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-600 dark:text-blue-400 font-sans">Hi, I'm Jiya</span>, a passionate Software Developer currently pursuing my BTech in Information Technology from Charotar University of Science and Technology (CHARUSAT). I am in my second year, building a strong foundation in software development and core computer science concepts.
              </p>
              <p className="text-slate-700 dark:text-white/80 leading-relaxed font-sans">
                I enjoy creating real-world applications that solve meaningful problems and love working with modern technologies. Problem-solving, especially in Data Structures and Algorithms, is something I genuinely enjoy as it combines logic with creativity.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Staggered bottom paragraph */}
        <motion.p
          className="mt-6 text-slate-700 dark:text-white/80 leading-relaxed font-sans"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          I am always eager to learn, explore new technologies, and continuously improve my skills while working towards becoming a skilled developer who can contribute to impactful and innovative projects.
        </motion.p>
      </div>
    </section>
  );
}
