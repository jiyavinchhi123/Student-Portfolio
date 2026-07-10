import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-900 dark:bg-black dark:text-white border-t border-slate-200/60 dark:border-white/10 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 text-center sm:text-left sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Jiya Vinchhi</p>
            <p className="text-sm text-slate-600 dark:text-white/60">
              Building impactful software solutions
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-slate-700 dark:text-white/80">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-white/60">
              <li>
                <a className="hover:text-blue-500 dark:hover:text-blue-300" href="#hero">
                  Home
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-500 dark:hover:text-blue-300"
                  href="#projects"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-500 dark:hover:text-blue-300"
                  href="#skills"
                >
                  Skills
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-500 dark:hover:text-blue-300"
                  href="#contact"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-widest text-slate-700 dark:text-white/80">
              Connect
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-600 dark:text-white/70">
              <a
                className="transition hover:text-blue-500 dark:hover:text-blue-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                href="https://github.com/jiyavinchhi123"
                target="_blank"
                rel="noreferrer"
              >
                <FiGithub size={20} />
              </a>
              <a
                className="transition hover:text-blue-500 dark:hover:text-blue-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                href="https://linkedin.com/in/jiya-vinchhi-a75678332/"
                target="_blank"
                rel="noreferrer"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                className="transition hover:text-blue-500 dark:hover:text-blue-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                href="mailto:jiya.vinchhi2412@gmail.com"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200/60 dark:border-white/10 pt-4 flex items-center justify-center">
          <p className="text-center text-xs text-slate-600 dark:text-white/60">
            © 2026 Jiya Vinchhi - Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
