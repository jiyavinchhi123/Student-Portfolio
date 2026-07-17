import { motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";

const links = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/skills", label: "Skills" },
  { path: "/projects", label: "Projects" },
  { path: "/achievements", label: "Achievements" },
  { path: "/contact", label: "Contact" }
];

export default function Navbar({ onToggleTheme, theme }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-[0_0_18px_rgba(59,130,246,0.35)] ${
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white/90 border-slate-200/60"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className={`text-lg font-semibold tracking-wide flex items-center ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          <span
            className={`mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border shadow-[0_0_14px_rgba(59,130,246,0.5)] ${
              theme === "dark"
                ? "border-white/40 text-white"
                : "border-slate-400/60 text-slate-900"
            }`}
          >
            JV
          </span>
          <span className="hidden sm:inline opacity-70">Jiya Vinchhi</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative transition px-1 py-1 ${
                  isActive
                    ? theme === "dark"
                      ? "text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] font-medium"
                      : "text-slate-900 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] font-medium"
                    : theme === "dark"
                      ? "text-white/60 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] w-full shadow-[0_0_14px_rgba(59,130,246,0.6)] ${
                        theme === "dark" ? "bg-white" : "bg-slate-900"
                      }`}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition shadow-[0_0_14px_rgba(59,130,246,0.5)] ${
              theme === "dark"
                ? "border-white/20 hover:border-white/60 text-white"
                : "border-slate-300/70 hover:border-slate-500 text-slate-700"
            }`}
            onClick={onToggleTheme}
            type="button"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button
            className={`md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              theme === "dark"
                ? "border-white/20 text-white"
                : "border-slate-300/70 text-slate-700"
            }`}
            onClick={() => setOpen((value) => !value)}
            type="button"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      {open && (
        <div
          className={`md:hidden border-t px-4 pb-4 ${
            theme === "dark" ? "border-white/10" : "border-slate-200/80"
          }`}
        >
          <div className="mx-auto grid max-w-6xl gap-1 pt-3 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 transition ${
                    isActive
                      ? theme === "dark"
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-950"
                      : theme === "dark"
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
}
