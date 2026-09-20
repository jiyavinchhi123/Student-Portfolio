import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail, FiEdit2 } from "react-icons/fi";
import useTyping from "./useTyping";
import ConstellationBackground from "./ConstellationBackground";
import whiteImg from "../assets/White.png";
import blackImg from "../assets/Black.png";
import resumeFile from "../../Jiya_Vinchhi_Resume.pdf";
import EditModal from "./EditModal";

const SERVER_URL = "http://localhost:5000";

export default function Header({ name: defaultName, themeColor, theme, isAdmin }) {
  const [profileData, setProfileData] = useState({
    name: defaultName || "JIYA",
    titles: ["Aspiring Software Developer", "Full Stack Developer", "Problem Solver"],
    profilePhotoUrl: "",
    shortIntro: "Aspiring Software Developer | Full Stack Developer",
    resumeUrl: "",
    githubUrl: "https://github.com/jiyavinchhi123",
    linkedinUrl: "https://linkedin.com/in/jiya-vinchhi-a75678332/",
    email: "jiya.vinchhi2412@gmail.com"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...profileData, titlesText: "" });

  const fetchProfile = () => {
    fetch(`${SERVER_URL}/portfolio/profile`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setProfileData(data);
          setFormData({ ...data, titlesText: data.titles?.join(", ") || "" });
        }
      })
      .catch(err => console.error("Error loading header profile data:", err));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const typed = useTyping(profileData.titles, 90, 1400);
  const isDark = theme === "dark";

  // Illustration interactive 3D tilt
  const handleIllustrationMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 10; // max 10 deg tilt
    const rotateX = -((y - yc) / yc) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleIllustrationMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  // Framer motion animation configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        ...formData,
        titles: formData.titlesText.split(",").map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch(`${SERVER_URL}/portfolio/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProfile();
      } else {
        alert("Failed to save profile changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving.");
    }
  };

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex items-center py-24 sm:py-28 overflow-hidden ${isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
    >
      <ConstellationBackground />
      {/* Background Ambient Glow Circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulseSoft" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[60px] sm:blur-[100px] pointer-events-none animate-pulseSoft [animation-delay:2.5s]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full z-10">
        
        {/* Floating Edit Button for Admins */}
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 right-4 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition border border-blue-500/20 z-30"
          >
            <FiEdit2 /> Edit Hero / Profile
          </button>
        )}

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">

          {/* Illustration Section */}
          <motion.div
            className="flex justify-center lg:justify-start items-start order-2 lg:order-1"
            initial="hidden"
            animate="visible"
            variants={imageVariants}
          >
            <motion.div
              className={`relative fade-bottom ${isDark ? "" : "fade-light"} cursor-pointer`}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              onMouseMove={handleIllustrationMouseMove}
              onMouseLeave={handleIllustrationMouseLeave}
              style={{ transition: "transform 0.2s ease-out" }}
            >
              <img
                src={theme === "dark" ? blackImg : whiteImg}
                alt={`${profileData.name} illustration`}
                className={`relative h-[clamp(230px,70vw,520px)] max-w-full w-auto transition-all duration-700 ${isDark ? "mix-blend-screen drop-shadow-[0_0_35px_rgba(59,130,246,0.15)]" : "mix-blend-multiply"
                  }`}
              />
            </motion.div>
          </motion.div>

          {/* Text Content Section */}
          <motion.div
            className="text-center lg:text-left order-1 lg:order-2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Outline title "JIYA'S" */}
            <motion.h1
              className="mt-4 font-bebas text-[clamp(3.25rem,18vw,9rem)] leading-none tracking-normal text-transparent"
              style={{
                WebkitTextStroke: isDark ? "1px #ffffff" : "2px #000000",
              }}
              variants={itemVariants}
            >
              {profileData.name}'S
            </motion.h1>

            {/* Solid title "PORTFOLIO" */}
            <motion.h2
              className={`font-bebas text-[clamp(3.4rem,18vw,9.5rem)] leading-none font-normal tracking-wide ${isDark ? "text-white/90" : "text-black"
                }`}
              variants={itemVariants}
            >
              PORTFOLIO
            </motion.h2>

            {/* Typing subtitle */}
            <motion.p
              className="mt-5 min-h-7 text-base sm:text-lg text-blue-600 dark:text-blue-400 font-semibold"
              variants={itemVariants}
            >
              {typed}
              <span className="ml-1 animate-pulse">|</span>
            </motion.p>

            {/* Actions Button Bar */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  to="/projects"
                  className={`inline-flex w-full items-center justify-center px-6 py-3 rounded-full text-sm font-semibold transition shadow-[0_0_18px_rgba(59,130,246,0.15)] hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] ${isDark ? "bg-white text-black hover:bg-slate-100" : "bg-black text-white hover:bg-slate-800"
                    }`}
                >
                  View Projects
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <a
                  href={profileData.resumeUrl || resumeFile}
                  download="Jiya_Vinchhi_Resume.pdf"
                  className={`inline-flex w-full items-center justify-center px-6 py-3 rounded-full text-sm font-semibold border transition shadow-[0_0_18px_rgba(59,130,246,0.05)] hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] ${isDark
                      ? "border-white/40 text-white hover:bg-white hover:text-black"
                      : "border-black/40 text-black hover:bg-black hover:text-white"
                    }`}
                >
                  Download Resume
                </a>
              </motion.div>
            </motion.div>

            {/* Social Icons Bar */}
            <motion.div
              className={`mt-6 flex items-center justify-center lg:justify-start gap-5 ${isDark ? "text-white/70" : "text-black/70"
                }`}
              variants={itemVariants}
            >
              <motion.a
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                href={profileData.githubUrl}
                aria-label="GitHub"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -4, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FiGithub size={22} />
              </motion.a>

              <motion.a
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                href={profileData.linkedinUrl}
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -4, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FiLinkedin size={22} />
              </motion.a>

              <motion.a
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                href={`mailto:${profileData.email}`}
                aria-label="Email"
                whileHover={{ y: -4, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FiMail size={22} />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile Information"
        onSave={handleSaveProfile}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Professional Titles (comma-separated)
            </label>
            <input
              type="text"
              value={formData.titlesText}
              onChange={(e) => setFormData({ ...formData, titlesText: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Profile Photo URL</label>
            <input
              type="text"
              value={formData.profilePhotoUrl}
              onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Short Introduction</label>
            <textarea
              value={formData.shortIntro}
              onChange={(e) => setFormData({ ...formData, shortIntro: e.target.value })}
              rows="2"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Resume File / Link</label>
            <input
              type="text"
              value={formData.resumeUrl}
              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GitHub Link</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">LinkedIn Link</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </EditModal>
    </section>
  );
}
