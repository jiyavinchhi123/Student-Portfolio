import { motion } from "framer-motion";
import profile from "../assets/Profile.jpeg";
import SectionTitle from "./SectionTitle";

export default function About() {
  return (
    <section id="about" className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle title="About Me" subtitle="Who I Am" />
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-10 items-center">
          <motion.div
            className="flex justify-center md:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-2xl" />
              <img
                src={profile}
                alt="Jiya Vinchhi"
                className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80 rounded-full border border-white/20 object-cover shadow-glow transition-transform duration-500 hover:scale-105"
              />
            </div>
          </motion.div>
          <div className="grid gap-6 md:order-1">
            <div className="space-y-4">
              <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-white/80 leading-relaxed">
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-400">Hi, I'm Jiya</span>, a passionate Software Developer currently pursuing my BTech in Information Technology from Charotar University of Science and Technology (CHARUSAT). I am in my second year, building a strong foundation in software development and core computer science concepts.
              </p>
              <p className="text-slate-700 dark:text-white/80 leading-relaxed">
                I enjoy creating real-world applications that solve meaningful problems and love working with modern technologies. Problem-solving, especially in Data Structures and Algorithms, is something I genuinely enjoy as it combines logic with creativity.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-slate-700 dark:text-white/80 leading-relaxed">
          I am always eager to learn, explore new technologies, and continuously improve my skills while working towards becoming a skilled developer who can contribute to impactful and innovative projects.
        </p>
      </div>
    </section>
  );
}
