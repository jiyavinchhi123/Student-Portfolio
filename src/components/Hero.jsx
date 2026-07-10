import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import useTyping from "./useTyping";
import whiteImg from "../assets/White.png";
import blackImg from "../assets/Black.png";
import resumeFile from "../../Jiya_Vinchhi_Resume.pdf";

export default function Hero({ theme }) {
  const words = ["Aspiring Software Developer", "Full Stack Developer", "Problem Solver"];
  const typed = useTyping(words, 90, 1400);
  const isDark = theme === "dark";

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex items-center py-24 sm:py-28 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            className="flex justify-center lg:justify-start items-start order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <motion.div
              className={`relative fade-bottom ${isDark ? "" : "fade-light"}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={theme === "dark" ? blackImg : whiteImg}
                alt="Jiya Vinchhi illustration"
                className={`relative h-[clamp(230px,70vw,520px)] max-w-full w-auto ${isDark ? "mix-blend-screen" : "mix-blend-multiply"
                  }`}
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="text-center lg:text-left order-1 lg:order-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <h1
              className="mt-4 font-bebas text-[clamp(3.25rem,18vw,9rem)] leading-none tracking-normal text-transparent"
              style={{ WebkitTextStroke: isDark ? "1px #ffffff" : "2px #000000" }}
            >
              JIYA'S
            </h1>
            <h2 className={`font-bebas text-[clamp(3.4rem,18vw,9.5rem)] leading-none font-normal tracking-wide ${isDark ? "text-white/90" : "text-black"}`}>
              PORTFOLIO
            </h2>
            <p className="mt-5 min-h-7 text-base sm:text-lg text-blue-300 dark:text-blue-500">
              {typed}
              <span className="ml-1 animate-pulse">|</span>
            </p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a
                href="#projects"
                className={`inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full text-sm font-semibold transition hover:scale-105 shadow-[0_0_18px_rgba(59,130,246,0.35)] ${isDark
                    ? "bg-white text-black "
                    : "bg-black text-white "
                  }`}
              >
                View Projects
              </a>
              <a
                href={resumeFile}
                download="Jiya_Vinchhi_Resume.pdf"
                className={`inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full text-sm font-semibold border transition hover:scale-105 shadow-[0_0_18px_rgba(59,130,246,0.35)] ${isDark
                    ? "border-white/40 text-white hover:bg-white hover:text-black"
                    : "border-black/40 text-black hover:bg-black hover:text-white"
                  }`}
              >
                Download Resume
              </a>
            </motion.div>
            <div className={`mt-6 flex items-center justify-center lg:justify-start gap-4 ${isDark ? "text-white/70" : "text-black/70"}`}>
              <a className="hover:scale-105 hover:text-blue-300 dark:hover:text-blue-500 transition" href="https://github.com/jiyavinchhi123" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
              <a className="hover:scale-105 hover:text-blue-300 dark:hover:text-blue-500 transition" href="https://linkedin.com/in/jiya-vinchhi-a75678332/" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a className="hover:scale-105 hover:text-blue-300 dark:hover:text-blue-500 transition" href="mailto:jiya.vinchhi2412@gmail.com" aria-label="Email">
                <FiMail size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
