import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiFileText, FiAward, FiSettings, FiGrid, 
  FiFolder, FiCpu, FiLogOut, FiSave, FiPlus, 
  FiTrash2, FiEdit2, FiCheck, FiAlertCircle 
} from "react-icons/fi";
import Spinner from "../components/Spinner";
import AdminLogin from "./AdminLogin";

const SERVER_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Counts and statistics for the dashboard home tab
  const [stats, setStats] = useState({
    skillsCount: 0,
    projectsCount: 0,
    achievementsCount: 0,
    educationCount: 0
  });

  // Section States
  const [profile, setProfile] = useState({
    name: "",
    titles: [],
    profilePhotoUrl: "",
    shortIntro: "",
    resumeUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    email: ""
  });

  const [about, setAbout] = useState({
    description: "",
    careerObjective: "",
    interests: []
  });

  const [educationList, setEducationList] = useState([]);
  
  // Helpers
  const [titlesText, setTitlesText] = useState("");
  const [interestsText, setInterestsText] = useState("");

  // Education Editor Form Modal / Inline State
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState(null);
  const [eduForm, setEduForm] = useState({
    degree: "",
    college: "",
    branch: "",
    startYear: "",
    graduationYear: "",
    description: ""
  });

  const showNotification = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  };

  const checkAuth = () => {
    const token = localStorage.getItem("admin_token");
    if (token === "admin-session-token-998") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Profile
      const profileRes = await fetch(`${SERVER_URL}/portfolio/profile`);
      let loadedProfile = {};
      if (profileRes.ok) {
        loadedProfile = await profileRes.json();
        setProfile(loadedProfile);
        setTitlesText(loadedProfile.titles?.join(", ") || "");
      }

      // 2. About
      const aboutRes = await fetch(`${SERVER_URL}/portfolio/about`);
      let loadedAbout = {};
      if (aboutRes.ok) {
        loadedAbout = await aboutRes.json();
        setAbout(loadedAbout);
        setInterestsText(loadedAbout.interests?.join(", ") || "");
      }

      // 3. Education
      const eduRes = await fetch(`${SERVER_URL}/portfolio/education`);
      let loadedEdu = [];
      if (eduRes.ok) {
        loadedEdu = await eduRes.json();
        setEducationList(loadedEdu);
      }

      // 4. Skills (for counts)
      const skillsRes = await fetch(`${SERVER_URL}/portfolio/skills`);
      const skillsData = skillsRes.ok ? await skillsRes.json() : [];

      // 5. Projects (for counts)
      const projectsRes = await fetch(`${SERVER_URL}/portfolio/projects`);
      const projectsData = projectsRes.ok ? await projectsRes.json() : [];

      // 6. Achievements (for counts)
      const achRes = await fetch(`${SERVER_URL}/portfolio/achievements`);
      const achData = achRes.ok ? await achRes.json() : [];

      // Set counts
      setStats({
        skillsCount: skillsData.length,
        projectsCount: projectsData.length,
        achievementsCount: achData.length,
        educationCount: loadedEdu.length
      });

    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      showNotification("error", "Error loading portfolio database information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profile,
        titles: titlesText.split(",").map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch(`${SERVER_URL}/portfolio/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        showNotification("success", "Profile configuration saved!");
      } else {
        showNotification("error", "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "An error occurred.");
    }
  };

  const handleAboutSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...about,
        interests: interestsText.split(",").map(i => i.trim()).filter(Boolean)
      };

      const res = await fetch(`${SERVER_URL}/portfolio/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAbout(data);
        showNotification("success", "About me text and objective saved!");
      } else {
        showNotification("error", "Failed to update about details.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "An error occurred.");
    }
  };

  // Education List Handlers
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEduId 
        ? `${SERVER_URL}/portfolio/education/${editingEduId}` 
        : `${SERVER_URL}/portfolio/education`;
      const method = editingEduId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eduForm)
      });

      if (res.ok) {
        showNotification("success", editingEduId ? "Education milestone edited!" : "Education milestone added!");
        setShowEduForm(false);
        setEditingEduId(null);
        setEduForm({ degree: "", college: "", branch: "", startYear: "", graduationYear: "", description: "" });
        
        // Refresh Education List & Counts
        const listRes = await fetch(`${SERVER_URL}/portfolio/education`);
        if (listRes.ok) {
          const list = await listRes.json();
          setEducationList(list);
          setStats(prev => ({ ...prev, educationCount: list.length }));
        }
      } else {
        showNotification("error", "Failed to save education entry.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "An error occurred.");
    }
  };

  const handleEditEdu = (edu) => {
    setEditingEduId(edu._id);
    setEduForm({
      degree: edu.degree || "",
      college: edu.college || edu.institution || "",
      branch: edu.branch || "",
      startYear: edu.startYear || "",
      graduationYear: edu.graduationYear || "",
      description: edu.description || ""
    });
    setShowEduForm(true);
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm("Are you sure you want to delete this education entry?")) return;
    try {
      const res = await fetch(`${SERVER_URL}/portfolio/education/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("success", "Education milestone deleted.");
        setEducationList(educationList.filter(item => item._id !== id));
        setStats(prev => ({ ...prev, educationCount: prev.educationCount - 1 }));
      } else {
        showNotification("error", "Failed to delete education.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "An error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => { setIsAuthenticated(true); fetchData(); }} />;
  }

  const sidebarLinks = [
    { name: "Dashboard", icon: FiGrid },
    { name: "Profile", icon: FiUser },
    { name: "About & Education", icon: FiFileText },
    { name: "Skills", icon: FiCpu },
    { name: "Projects", icon: FiFolder },
    { name: "Achievements", icon: FiAward },
    { name: "Task Space", icon: FiSettings, disabled: true },
    { name: "Settings", icon: FiSettings }
  ];

  return (
    <div className="min-h-screen flex bg-[#0c0c0e] text-white font-sans overflow-hidden">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/5 bg-[#121215] flex flex-col shrink-0">
        {/* Sidebar Brand Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              JV
            </span>
            <span className="font-bold tracking-wide text-sm text-slate-200">Admin Panel</span>
          </div>
        </div>

        {/* Sidebar Nav List */}
        <nav className="flex-grow p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.name;
            return (
              <button
                key={link.name}
                onClick={() => !link.disabled && setActiveTab(link.name)}
                disabled={link.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition relative ${
                  link.disabled 
                    ? "opacity-35 cursor-not-allowed" 
                    : isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
                {link.disabled && (
                  <span className="absolute right-3 text-[9px] uppercase tracking-widest font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/50">
                    Muted
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Logout Bar */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-grow flex flex-col min-h-screen relative overflow-y-auto">
        
        {/* Global Notifications Inside Header */}
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute top-4 right-6 z-50 p-4 rounded-xl flex items-center gap-3 border shadow-lg ${
                status.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {status.type === "success" ? <FiCheck className="text-lg" /> : <FiAlertCircle className="text-lg" />}
              <span className="text-xs font-semibold">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Body Section */}
        <div className="p-8 max-w-5xl w-full mx-auto">
          
          {/* Active Tab View Rendering */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-wide">Welcome back, Jiya</h2>
                <p className="text-slate-400 text-sm mt-1">Here is a quick overview of your portfolio metrics.</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Skills", count: stats.skillsCount, color: "border-blue-500/20 text-blue-400" },
                  { label: "Featured Projects", count: stats.projectsCount, color: "border-indigo-500/20 text-indigo-400" },
                  { label: "Milestones", count: stats.achievementsCount, color: "border-purple-500/20 text-purple-400" },
                  { label: "Education Entries", count: stats.educationCount, color: "border-emerald-500/20 text-emerald-400" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 bg-[#121215] border rounded-2xl ${item.color.split(" ")[0]} shadow-inner`}>
                    <p className="text-3xl font-bold font-sans">{item.count}</p>
                    <p className="text-slate-400 text-xs mt-1 uppercase font-semibold tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions Panel */}
              <div className="p-6 bg-[#121215] border border-white/5 rounded-2xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveTab("Profile")}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 text-left"
                  >
                    <p className="font-semibold text-sm">Update Profile Info</p>
                    <p className="text-[11px] text-slate-400 mt-1">Name, titles, resume, socials</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab("About & Education")}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 text-left"
                  >
                    <p className="font-semibold text-sm">Manage Bio & Education</p>
                    <p className="text-[11px] text-slate-400 mt-1">Timeline events,objective statements</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-wide">Manage Profile</h2>
                <p className="text-slate-400 text-sm mt-1">Edit key details rendered on your landing/hero view.</p>
              </div>

              <div className="bg-[#121215] border border-white/5 p-6 rounded-2xl">
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Profile Photo URL</label>
                      <input
                        type="text"
                        value={profile.profilePhotoUrl}
                        onChange={(e) => setProfile({ ...profile, profilePhotoUrl: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                        placeholder="Link to avatar jpeg/png"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Professional Titles (comma-separated list)
                    </label>
                    <input
                      type="text"
                      value={titlesText}
                      onChange={(e) => setTitlesText(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="Full Stack Developer, Problem Solver, Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Introduction / Bio Summary</label>
                    <textarea
                      value={profile.shortIntro}
                      onChange={(e) => setProfile({ ...profile, shortIntro: e.target.value })}
                      rows="2"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="Brief personal summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume File Link</label>
                    <input
                      type="text"
                      value={profile.resumeUrl}
                      onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="Resume URL"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={profile.githubUrl}
                        onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profile.linkedinUrl}
                        onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 transition shadow-md"
                  >
                    <FiSave size={14} /> Save Profile Config
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "About & Education" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-wide">About & Education Details</h2>
                <p className="text-slate-400 text-sm mt-1">Manage career objective statement, personal description, and academic timeline.</p>
              </div>

              {/* Bio & Career Form */}
              <div className="bg-[#121215] border border-white/5 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Bio and Objectives</h3>
                <form onSubmit={handleAboutSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About Description</label>
                    <textarea
                      value={about.description}
                      onChange={(e) => setAbout({ ...about, description: e.target.value })}
                      rows="4"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="About text..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Career Objective</label>
                    <textarea
                      value={about.careerObjective}
                      onChange={(e) => setAbout({ ...about, careerObjective: e.target.value })}
                      rows="3"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="Career focus/aims..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interests (comma-separated list)</label>
                    <input
                      type="text"
                      value={interestsText}
                      onChange={(e) => setInterestsText(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      placeholder="Algorithms, Data Structures, Web Design"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-md"
                  >
                    <FiSave size={14} /> Save Bio Changes
                  </button>
                </form>
              </div>

              {/* Education CRUD List */}
              <div className="bg-[#121215] border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Academic History</h3>
                  <button
                    onClick={() => {
                      setEditingEduId(null);
                      setEduForm({ degree: "", college: "", branch: "", startYear: "", graduationYear: "", description: "" });
                      setShowEduForm(true);
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  >
                    <FiPlus /> Add Entry
                  </button>
                </div>

                {/* Form Modal / Inline Form Block */}
                {showEduForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-5 rounded-xl border border-white/5 bg-[#17171c] mb-6 space-y-4"
                  >
                    <h4 className="text-xs font-bold text-slate-200">
                      {editingEduId ? "Edit Education Entry" : "Create Education Entry"}
                    </h4>
                    <form onSubmit={handleEduSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Degree Name</label>
                          <input
                            type="text"
                            value={eduForm.degree}
                            onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Institution</label>
                          <input
                            type="text"
                            value={eduForm.college}
                            onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Branch / Stream</label>
                          <input
                            type="text"
                            value={eduForm.branch}
                            onChange={(e) => setEduForm({ ...eduForm, branch: e.target.value })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Start Year</label>
                          <input
                            type="text"
                            value={eduForm.startYear}
                            onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Graduation Year</label>
                          <input
                            type="text"
                            value={eduForm.graduationYear}
                            onChange={(e) => setEduForm({ ...eduForm, graduationYear: e.target.value })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Description / Details</label>
                        <textarea
                          value={eduForm.description}
                          onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                          rows="2"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 transition text-white"
                        >
                          {editingEduId ? "Update Entry" : "Save Entry"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEduForm(false);
                            setEditingEduId(null);
                          }}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/5 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Academic Timeline Elements List */}
                <div className="grid md:grid-cols-2 gap-4">
                  {educationList.map((edu) => (
                    <div key={edu._id} className="p-4 rounded-xl border border-white/5 bg-[#17171c]/50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-slate-200">{edu.degree}</h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditEdu(edu)}
                              className="p-1 hover:text-blue-400 transition"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteEdu(edu._id)}
                              className="p-1 hover:text-red-400 transition"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-blue-400 font-semibold mt-0.5">{edu.college || edu.institution}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                          {edu.startYear ? `${edu.startYear} - ` : ""}{edu.graduationYear}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for Skills, Projects, Achievements, Settings */}
          {["Skills", "Projects", "Achievements", "Settings"].includes(activeTab) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-wide">{activeTab} Section</h2>
                <p className="text-slate-400 text-sm mt-1">Administrative section dashboard for managing {activeTab}.</p>
              </div>
              <div className="p-12 text-center bg-[#121215] border border-white/5 rounded-2xl text-slate-400 text-sm font-semibold">
                This tab structure is ready. Forms for viewing, adding, and deleting {activeTab} data will be populated in subsequent phases.
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
