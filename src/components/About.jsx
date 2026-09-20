import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import profile from "../assets/Profile.jpeg";
import SectionTitle from "./SectionTitle";
import EditModal from "./EditModal";

const SERVER_URL = "http://localhost:5000";

export default function About({ isAdmin }) {
  const [aboutData, setAboutData] = useState({
    description: "Hi, I'm Jiya, a passionate Software Developer currently pursuing my BTech in Information Technology from Charotar University of Science and Technology (CHARUSAT). I am in my second year, building a strong foundation in software development and core computer science concepts.",
    careerObjective: "I enjoy creating real-world applications that solve meaningful problems and love working with modern technologies. Problem-solving, especially in Data Structures and Algorithms, is something I genuinely enjoy as it combines logic with creativity.",
    interests: ["Problem Solving", "Data Structures", "Algorithms", "Web Development"]
  });

  const [profilePhoto, setProfilePhoto] = useState(profile);
  const [educationList, setEducationList] = useState([]);

  // Modal open states
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);

  // Form states
  const [bioForm, setBioForm] = useState({
    description: "",
    careerObjective: "",
    interestsText: ""
  });

  const [editingEduId, setEditingEduId] = useState(null);
  const [eduForm, setEduForm] = useState({
    degree: "",
    college: "",
    branch: "",
    startYear: "",
    graduationYear: "",
    description: ""
  });

  const fetchAbout = () => {
    fetch(`${SERVER_URL}/portfolio/about`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setAboutData(data);
          setBioForm({
            description: data.description || "",
            careerObjective: data.careerObjective || "",
            interestsText: data.interests?.join(", ") || ""
          });
        }
      })
      .catch(err => console.error("Error loading about data:", err));
  };

  const fetchEducation = () => {
    fetch(`${SERVER_URL}/portfolio/education`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) setEducationList(data);
      })
      .catch(err => console.error("Error loading education list:", err));
  };

  const fetchProfilePhoto = () => {
    fetch(`${SERVER_URL}/portfolio/profile`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.profilePhotoUrl) {
          setProfilePhoto(data.profilePhotoUrl);
        }
      })
      .catch(err => console.error("Error loading profile photo:", err));
  };

  useEffect(() => {
    fetchAbout();
    fetchProfilePhoto();
    fetchEducation();
  }, []);

  const handleBioSave = async () => {
    try {
      const payload = {
        description: bioForm.description,
        careerObjective: bioForm.careerObjective,
        interests: bioForm.interestsText.split(",").map(i => i.trim()).filter(Boolean)
      };

      const res = await fetch(`${SERVER_URL}/portfolio/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsBioModalOpen(false);
        fetchAbout();
      } else {
        alert("Failed to save bio modifications.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEduSave = async () => {
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
        setIsEduModalOpen(false);
        setEditingEduId(null);
        fetchEducation();
      } else {
        alert("Failed to save education timeline details.");
      }
    } catch (err) {
      console.error(err);
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
    setIsEduModalOpen(true);
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm("Delete this education entry?")) return;
    try {
      const res = await fetch(`${SERVER_URL}/portfolio/education/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchEducation();
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="about" className="section-padding overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* About Headline Block */}
        <div className="relative">
          <SectionTitle title="About Me" subtitle="Who I Am" />
          {isAdmin && (
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="absolute top-0 right-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
            >
              <FiEdit2 /> Edit Bio Description
            </button>
          )}
        </div>

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
              <motion.div
                className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/25 to-indigo-600/15 blur-2xl pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <img
                src={profilePhoto}
                alt="Jiya Vinchhi"
                className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80 rounded-full border border-slate-200/50 dark:border-white/10 object-cover shadow-glow transition-all duration-500 hover:scale-[1.03]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = profile;
                }}
              />
            </div>
          </motion.div>

          {/* Text Area */}
          <div className="grid gap-6 md:order-1">
            <div className="space-y-4 font-sans leading-relaxed">
              <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-white/80">
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-600 dark:text-blue-400">Hi, I'm Jiya</span>, a passionate Software Developer.
              </p>
              <p className="text-slate-700 dark:text-white/80">
                {aboutData.description}
              </p>
              {aboutData.careerObjective && (
                <p className="text-slate-700 dark:text-white/80">
                  <strong>Career Objective:</strong> {aboutData.careerObjective}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Interests Grid */}
        {aboutData.interests && aboutData.interests.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Interests & Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {aboutData.interests.map((interest, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/80 border border-slate-200 dark:border-white/5">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education Timeline */}
        <div className="mt-12 border-t border-slate-200 dark:border-white/10 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Education Timeline</h3>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingEduId(null);
                  setEduForm({ degree: "", college: "", branch: "", startYear: "", graduationYear: "", description: "" });
                  setIsEduModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <FiPlus /> Add Education Entry
              </button>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {educationList.map((edu) => (
              <div 
                key={edu._id}
                className="glass p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{edu.degree}</h4>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditEdu(edu)}
                          className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
                          title="Edit"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteEdu(edu._id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                    {edu.college || edu.institution} {edu.branch && `(${edu.branch})`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                    {edu.startYear ? `${edu.startYear} - ` : ""}{edu.graduationYear}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-slate-700 dark:text-white/70 mt-3 font-sans leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 1. Bio Editor Modal */}
      <EditModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        title="Edit Bio Description"
        onSave={handleBioSave}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">About Me Description</label>
            <textarea
              value={bioForm.description}
              onChange={(e) => setBioForm({ ...bioForm, description: e.target.value })}
              rows="4"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Career Objective</label>
            <textarea
              value={bioForm.careerObjective}
              onChange={(e) => setBioForm({ ...bioForm, careerObjective: e.target.value })}
              rows="3"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Interests (comma-separated)</label>
            <input
              type="text"
              value={bioForm.interestsText}
              onChange={(e) => setBioForm({ ...bioForm, interestsText: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      </EditModal>

      {/* 2. Education Modal */}
      <EditModal
        isOpen={isEduModalOpen}
        onClose={() => setIsEduModalOpen(false)}
        title={editingEduId ? "Edit Education timeline" : "Add Education timeline"}
        onSave={handleEduSave}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Degree</label>
            <input
              type="text"
              value={eduForm.degree}
              onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">College/University</label>
            <input
              type="text"
              value={eduForm.college}
              onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Branch</label>
            <input
              type="text"
              value={eduForm.branch}
              onChange={(e) => setEduForm({ ...eduForm, branch: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Start Year</label>
              <input
                type="text"
                value={eduForm.startYear}
                onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Graduation Year</label>
              <input
                type="text"
                value={eduForm.graduationYear}
                onChange={(e) => setEduForm({ ...eduForm, graduationYear: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
            <textarea
              value={eduForm.description}
              onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
              rows="2"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      </EditModal>
    </section>
  );
}
