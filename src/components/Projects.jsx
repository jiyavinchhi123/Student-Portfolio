import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiCheck } from "react-icons/fi";
import finliteImg from "../assets/projects/FinLite.png";
import formfluxImg from "../assets/projects/FormFlux.png";
import resumefitImg from "../assets/projects/ResumeFit.png";
import siyarangImg from "../assets/projects/SiyaRang.png";
import taskmanagerImg from "../assets/projects/TaskManager.png";
import Spinner from "./Spinner.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import EditModal from "./EditModal.jsx";

const SERVER_URL = "http://localhost:5000";

const imageMap = {
  siyarangImg: siyarangImg,
  resumefitImg: resumefitImg,
  finliteImg: finliteImg,
  formfluxImg: formfluxImg,
  taskmanagerImg: taskmanagerImg
};

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

function FeaturedProjectCard({ project, handleMouseMove, handleMouseLeave, isAdmin, onEdit, onDelete, onToggleMilestone }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isLocalDemo = project.demo && project.demo.startsWith("/");

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
  const displayImage = imageMap[project.image] || project.image || taskmanagerImg;

  return (
    <div className="relative w-full h-[620px] sm:h-[580px] lg:h-[450px] [perspective:1500px]">
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-in-out"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_16px_32px_rgba(15,23,42,0.08)] p-4 sm:p-6 lg:p-8 grid lg:grid-cols-2 gap-6 lg:gap-8 items-center transition-all duration-300 ease-out overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Admin Edit/Delete */}
          {isAdmin && (
            <div className="absolute top-4 left-4 flex gap-2 z-30">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 shadow transition"
                title="Edit project"
              >
                <FiEdit2 size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
                className="bg-red-600 hover:bg-red-500 text-white rounded-full p-2 shadow transition"
                title="Delete project"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          )}

          {!isLocalDemo && (
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
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white font-sans">
                {project.name}
              </h3>
              <p className="text-slate-600 dark:text-white/70 mt-2 text-sm leading-relaxed font-sans">{project.description}</p>
            </div>
            <TechBadges items={project.tech || []} />
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-white/70 space-y-1 font-sans">
              {(project.features || []).map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>

            {/* Recruiter Milestones Display */}
            {project.milestones && project.milestones.length > 0 && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Technical Task Progress:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {project.milestones.map((milestone, idx) => (
                    <label key={idx} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        disabled={!isAdmin}
                        onChange={() => onToggleMilestone(project, idx)}
                        className="rounded text-blue-500 bg-slate-100 border-slate-300 dark:bg-white/5 dark:border-white/10"
                      />
                      <span className={milestone.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"}>
                        {milestone.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {isLocalDemo ? (
                <Link
                  to={project.demo}
                  className="inline-flex justify-center items-center px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-md transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] cursor-pointer"
                >
                  Try Interactive Demo
                </Link>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex justify-center px-5 py-2 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-md transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] cursor-pointer"
                  title="Or double-click the top-right corner!"
                >
                  Watch Demo
                </button>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center px-5 py-2 text-sm font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] cursor-pointer"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
          <div className="relative group hidden lg:block">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 blur-2xl dark:from-blue-500/10 dark:to-blue-600/5" />
            <img
              src={displayImage}
              alt={project.name}
              className="relative rounded-2xl w-full h-48 sm:h-64 object-cover shadow-lg dark:shadow-none"
            />
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 lg:p-8 flex flex-col justify-between shadow-[0_16px_32px_rgba(15,23,42,0.5)] overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
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
              {isFlipped && !isLocalDemo && (
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

export default function Projects({ isAdmin }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Db Projects state
  const [dbProjects, setDbProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState(null);
  const [projForm, setProjForm] = useState({
    name: "",
    description: "",
    techText: "",
    featuresText: "",
    demo: "",
    repo: "",
    image: "",
    milestonesText: ""
  });

  const fetchDbProjects = () => {
    fetch(`${SERVER_URL}/portfolio/projects`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) setDbProjects(data);
      })
      .catch(err => console.error("Error loading database projects:", err));
  };

  useEffect(() => {
    fetchDbProjects();
  }, []);

  const handleEdit = (proj) => {
    setEditingProjId(proj._id);
    setProjForm({
      name: proj.name || "",
      description: proj.description || "",
      techText: proj.tech?.join(", ") || "",
      featuresText: proj.features?.join("\n") || "",
      demo: proj.demo || "",
      repo: proj.repo || "",
      image: proj.image || "",
      milestonesText: proj.milestones?.map(m => `${m.label}:${m.completed}`).join(", ") || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(`${SERVER_URL}/portfolio/projects/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchDbProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (project, milestoneIndex) => {
    try {
      const updatedMilestones = [...project.milestones];
      updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;

      const res = await fetch(`${SERVER_URL}/portfolio/projects/${project._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones })
      });

      if (res.ok) {
        fetchDbProjects();
      }
    } catch (err) {
      console.error("Error toggling project milestone:", err);
    }
  };

  const handleProjSave = async () => {
    try {
      // Parse milestones
      const milestones = projForm.milestonesText
        .split(",")
        .map(item => {
          const parts = item.split(":");
          const label = parts[0]?.trim();
          if (!label) return null;
          const completed = parts[1]?.trim().toLowerCase() === "true";
          return { label, completed };
        })
        .filter(Boolean);

      const payload = {
        name: projForm.name,
        description: projForm.description,
        tech: projForm.techText.split(",").map(t => t.trim()).filter(Boolean),
        features: projForm.featuresText.split("\n").map(f => f.trim()).filter(Boolean),
        demo: projForm.demo,
        repo: projForm.repo,
        image: projForm.image,
        milestones
      };

      const url = editingProjId 
        ? `${SERVER_URL}/portfolio/projects/${editingProjId}` 
        : `${SERVER_URL}/portfolio/projects`;
      const method = editingProjId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProjId(null);
        fetchDbProjects();
      } else {
        alert("Failed to save project.");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    <section id="projects" className="section-padding relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="relative text-center mb-10 sm:mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
            Featured Work
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Real-World Projects
          </h2>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingProjId(null);
                setProjForm({ name: "", description: "", techText: "", featuresText: "", demo: "", repo: "", image: "", milestonesText: "" });
                setIsModalOpen(true);
              }}
              className="absolute top-0 right-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
            >
              <FiPlus /> Add Project
            </button>
          )}
        </div>

        {/* Featured Projects Grid */}
        <div className="space-y-8 sm:space-y-12">
          {dbProjects.map((project) => (
            <FeaturedProjectCard
              key={project._id}
              project={project}
              handleMouseMove={handleMouseMove}
              handleMouseLeave={handleMouseLeave}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleMilestone={handleToggleMilestone}
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
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200/80 bg-white/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
          )}

          {/* Grid Layout of Cards */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto">
              <ErrorMessage
                message={error}
                hint="Verify your internet connection or check if the GitHub username is correct."
                onRetry={handleRetry}
              />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No repositories found matching "{searchTerm}"
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.slice(0, 6).map((repo) => (
                <div
                  key={repo.id}
                  className="glass flex flex-col justify-between p-6 rounded-2xl border border-slate-200/85 hover:border-blue-500/40 dark:border-white/10 dark:hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                      {repo.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ★ {repo.stargazers_count} Stars
                    </span>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition"
                    >
                      View Code →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Editor Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProjId ? "Edit Project Details" : "Add New Project"}
        onSave={handleProjSave}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Project Name</label>
            <input
              type="text"
              value={projForm.name}
              onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
            <textarea
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
              rows="3"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={projForm.techText}
              onChange={(e) => setProjForm({ ...projForm, techText: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              placeholder="e.g. React, Spring Boot, Python"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Features (one per line)</label>
            <textarea
              value={projForm.featuresText}
              onChange={(e) => setProjForm({ ...projForm, featuresText: e.target.value })}
              rows="3"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              placeholder="Auto PDF generation&#10;Balance sheets"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Demo link</label>
              <input
                type="text"
                value={projForm.demo}
                onChange={(e) => setProjForm({ ...projForm, demo: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub Link</label>
              <input
                type="text"
                value={projForm.repo}
                onChange={(e) => setProjForm({ ...projForm, repo: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Image Key</label>
              <input
                type="text"
                value={projForm.image}
                onChange={(e) => setProjForm({ ...projForm, image: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs focus:outline-none"
                placeholder="e.g. siyarangImg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Technical Tasks / Milestones (format: label:completed, label:completed)
            </label>
            <input
              type="text"
              value={projForm.milestonesText}
              onChange={(e) => setProjForm({ ...projForm, milestonesText: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              placeholder="e.g. Design:true, Database:false"
            />
          </div>
        </div>
      </EditModal>
    </section>
  );
}
