import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import finliteImg from "../assets/projects/FinLite.png";
import formfluxImg from "../assets/projects/FormFlux.png";
import resumefitImg from "../assets/projects/ResumeFit.png";
import siyarangImg from "../assets/projects/SiyaRang.png";
import Spinner from "./Spinner.jsx";
import ErrorMessage from "./ErrorMessage.jsx";

const projects = [
  {
    name: "SiyaRang",
    description: "Customized e-commerce platform for a Bandhani store.",
    tech: ["HTML", "CSS", "JS", "Python"],
    features: ["Product catalog", "Custom UI", "Secure storage"],
    demo: "https://www.youtube.com/watch?v=FVvFQQ20D3M",
    repo: "https://github.com/jiyavinchhi123/SiyaRang-Bandhej",
    image: siyarangImg
  },
  {
    name: "ResumeFit",
    description: "Resume-to-job fit scoring with actionable improvements.",
    tech: ["Java", "Python", "Supabase"],
    features: ["Score out of 100", "Suggestions", "Trial model"],
    demo: "https://www.youtube.com/watch?v=wBWmEWm8Bvg",
    repo: "https://github.com/jiyavinchhi123/Job-Fit-Score",
    image: resumefitImg
  },
  {
    name: "FinLite",
    description:
      "Smart finance manager built for modern business owners with automated insights and beautiful reporting.",
    tech: ["React", "Spring Boot", "Supabase", "Python", "Charts"],
    features: [
      "Auto PDF balance sheet generation",
      "Smart predictions with interactive charts",
      "Guided, user-friendly workflows"
    ],
    demo: "https://www.youtube.com/watch?v=TQz-BSR0Dv4&t=15s",
    repo: "https://github.com/jiyavinchhi123/FinLite",
    image: finliteImg
  },
  {
    name: "FormFlux",
    description: "Dynamic form generator with database integration.",
    tech: ["MongoDB", "Java", "JS"],
    features: ["Auto DB creation", "Response tracking", "XLSX export"],
    demo: "https://www.youtube.com/watch?v=MhxHFskRKCw&t=8s",
    repo: "https://github.com/jiyavinchhi123/FormFlux",
    image: formfluxImg
  }
];

function TechBadges({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs px-3 py-1 rounded-full bg-white/80 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/80 dark:border-white/10"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function FeaturedProjectCard({ project, handleMouseMove, handleMouseLeave }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Parse standard watch URL to clean embed link
  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {
      console.error("YouTube URL parse error", e);
    }
    return url;
  };

  const embedUrl = getEmbedUrl(project.demo);

  return (
    <div className="relative w-full h-[580px] sm:h-[520px] lg:h-[400px] [perspective:1500px]">
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-in-out"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side: Specifications and details */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_16px_32px_rgba(15,23,42,0.08)] p-4 sm:p-6 lg:p-8 grid lg:grid-cols-2 gap-6 lg:gap-8 items-center transition-all duration-300 ease-out overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top-Right Dog-Ear Corner Flap */}
          <div
            onDoubleClick={() => setIsFlipped(true)}
            className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-600 to-blue-500 rounded-bl-3xl shadow-[0_4px_12px_rgba(59,130,246,0.3)] flex items-center justify-center cursor-pointer group/corner z-25 transition-all duration-300 hover:w-14 hover:h-14"
            title="Double click corner to flip card and play video!"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-white -translate-y-1.5 translate-x-1.5 rotate-45 transition-transform group-hover/corner:scale-110"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.33-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white font-sans">
                {project.name}
              </h3>
              <p className="text-slate-600 dark:text-white/70 mt-2 text-sm leading-relaxed font-sans">{project.description}</p>
            </div>
            <TechBadges items={project.tech} />
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-white/70 space-y-1.5 font-sans">
              {project.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setIsFlipped(true)}
                className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-md transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] cursor-pointer"
                title="Or double-click the top-right corner!"
              >
                Watch Demo
              </button>
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] cursor-pointer"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="relative group hidden lg:block">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 blur-2xl dark:from-blue-500/10 dark:to-blue-600/5" />
            <img
              src={project.image}
              alt={project.name}
              className="relative rounded-2xl w-full h-48 sm:h-64 object-cover shadow-lg dark:shadow-none"
            />
          </div>
        </div>

        {/* Back Side: Embedded video canvas */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 lg:p-8 flex flex-col justify-between shadow-[0_16px_32px_rgba(15,23,42,0.5)] overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Top-Right Return Corner Flap */}
          <div
            onDoubleClick={() => setIsFlipped(false)}
            className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-slate-800 to-slate-700 rounded-bl-3xl shadow-md flex items-center justify-center cursor-pointer group/corner z-25 transition-all duration-300 hover:w-14 hover:h-14"
            title="Double click corner to return to details!"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-white -translate-y-1.5 translate-x-1.5 rotate-45 transition-transform group-hover/corner:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </div>

          <div className="relative w-full h-full flex flex-col justify-between gap-4">
            <div className="relative w-full flex-grow overflow-hidden rounded-xl bg-black border border-white/5 shadow-inner">
              {isFlipped && (
                <iframe
                  src={embedUrl}
                  title={`${project.name} Demo`}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <div className="flex justify-between items-center shrink-0 pt-2 border-t border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white font-sans">
                  {project.name} - Demo Presentation
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Double-click top-right corner to return</p>
              </div>
              <button
                onClick={() => setIsFlipped(false)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer"
              >
                Back to Details
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Premium 3D tilt handler
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 7; // max 7 deg
    const rotateX = -((y - yc) / yc) * 7; // max 7 deg
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = "0 20px 30px rgba(59, 130, 246, 0.2)";
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.boxShadow = "";
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Dynamic fetch from public GitHub API for user jiyavinchhi123
    fetch("https://api.github.com/users/jiyavinchhi123/repos")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load repositories (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            // Sort by stargazers count desc
            const sorted = data.sort((a, b) => b.stargazers_count - a.stargazers_count);
            setRepos(sorted);
          } else {
            throw new Error("Invalid response format received from GitHub API");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="projects" className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
            Featured Work
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Real-World Projects
          </h2>
        </div>

        {/* Featured Projects Grid */}
        <div className="space-y-8 sm:space-y-12">
          {projects.map((project) => (
            <FeaturedProjectCard
              key={project.name}
              project={project}
              handleMouseMove={handleMouseMove}
              handleMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* Dynamic GitHub Repositories Section */}
        <div className="mt-20 border-t border-slate-200 dark:border-white/10 pt-16">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              GitHub Repositories
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Dynamic Projects
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
              Real-time public codebases fetched directly from my GitHub profile.
            </p>
          </div>

          {/* Search/Filter Input */}
          {!loading && !error && (
            <div className="max-w-md mx-auto mb-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400 dark:text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search repositories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/5 backdrop-blur-md text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all font-sans text-sm"
              />
            </div>
          )}

          {/* Dynamic Content Rendering */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : (
            <>
              {filteredRepos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 font-sans">
                    No repositories found matching "{searchTerm}"
                  </p>
                </div>
              ) : (
                <motion.div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.08 } }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {filteredRepos.map((repo) => (
                    <motion.div
                      key={repo.id}
                      className="flex flex-col justify-between p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300 ease-out group"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div>
                        {/* Title and Stars */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-sans" title={repo.name}>
                            {repo.name}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-sans text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3 w-3 text-yellow-500"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.1-.219 4.755c-.038.84.814 1.46 1.539 1.1l4.099-2.058 4.099 2.058c.725.36 1.577-.26 1.539-1.1l-.218-4.755 3.6-3.1c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {repo.stargazers_count}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 dark:text-white/70 text-sm mt-3 line-clamp-3 min-h-[3rem] font-sans">
                          {repo.description || "No description provided."}
                        </p>
                      </div>

                      {/* Language and Link */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                        {repo.language ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 px-2 py-1 rounded font-sans">
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 rounded font-sans">
                            N/A
                          </span>
                        )}

                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all cursor-pointer font-sans"
                        >
                          View Repo
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="h-3 w-3 group-hover:translate-x-0.5 transition-transform"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
