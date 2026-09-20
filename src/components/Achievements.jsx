import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiAward, FiTrendingUp, FiStar, FiUsers, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import EditModal from "./EditModal";

const SERVER_URL = "http://localhost:5000";

const iconMap = {
  FiAward: FiAward,
  FiStar: FiStar,
  FiUsers: FiUsers,
  FiTrendingUp: FiTrendingUp
};

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Premium 3D tilt handlers
const handleMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  const rotateY = ((x - xc) / xc) * 8;
  const rotateX = -((y - yc) / yc) * 8;
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  card.style.boxShadow = "0 15px 25px rgba(59, 130, 246, 0.18)";
};

const handleMouseLeave = (e) => {
  const card = e.currentTarget;
  card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  card.style.boxShadow = "";
};

function StatCard({ value, label, isAdmin, onEdit, onDelete, ach }) {
  return (
    <motion.div
      variants={item}
      className="glass rounded-2xl p-5 text-center border border-slate-200/60 dark:border-white/10 shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all duration-300 ease-out cursor-pointer relative group/stat"
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/stat:opacity-100 transition z-30">
          <button onClick={(e) => { e.stopPropagation(); onEdit(ach); }} className="p-1 hover:text-blue-500 transition"><FiEdit2 size={11} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(ach._id); }} className="p-1 hover:text-red-500 transition"><FiTrash2 size={11} /></button>
        </div>
      )}
      <motion.div
        className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-sans"
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        viewport={{ once: true }}
      >
        {value}
      </motion.div>
      <div className="mt-1 text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold font-sans">
        {label}
      </div>
    </motion.div>
  );
}

function AchievementCard({ title, description, icon: IconKey, isAdmin, onEdit, onDelete, ach }) {
  const Icon = iconMap[IconKey] || FiAward;
  return (
    <motion.div
      variants={item}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:shadow-[0_0_24px_rgba(59,130,246,0.25)] transition-all duration-300 ease-out cursor-pointer group relative"
      whileHover="hovered"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-30">
          <button onClick={(e) => { e.stopPropagation(); onEdit(ach); }} className="p-1 hover:text-blue-500 transition"><FiEdit2 size={11} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(ach._id); }} className="p-1 hover:text-red-500 transition"><FiTrash2 size={11} /></button>
        </div>
      )}
      <div className="flex items-start gap-3">
        <motion.div
          className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
          variants={{
            hovered: { rotate: 360, scale: 1.15, backgroundColor: "rgba(59,130,246,0.2)" }
          }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
        >
          <Icon className="text-lg" />
        </motion.div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white font-sans group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/70 font-sans">
            {description}
          </p>
        </div>
      </div>
      <motion.div
        className="mt-4 h-[2px] w-12 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300"
        variants={{
          hovered: { width: "100%" }
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export default function Achievements({ isAdmin }) {
  const [achList, setAchList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: "achievement",
    title: "",
    description: "",
    icon: "FiAward",
    value: "",
    label: ""
  });

  const fetchAchievements = () => {
    fetch(`${SERVER_URL}/portfolio/achievements`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) setAchList(data);
      })
      .catch(err => console.error("Error loading achievements:", err));
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleEdit = (ach) => {
    setEditingId(ach._id);
    setForm({
      type: ach.type || "achievement",
      title: ach.title || "",
      description: ach.description || "",
      icon: ach.icon || "FiAward",
      value: ach.value || "",
      label: ach.label || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this milestone?")) return;
    try {
      const res = await fetch(`${SERVER_URL}/portfolio/achievements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchAchievements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingId 
        ? `${SERVER_URL}/portfolio/achievements/${editingId}` 
        : `${SERVER_URL}/portfolio/achievements`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchAchievements();
      } else {
        alert("Failed to save achievement.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = achList.filter(a => a.type === "stat");
  const achievements = achList.filter(a => a.type === "achievement");

  return (
    <section id="achievements" className="section-padding bg-white dark:bg-black relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="relative text-center mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] text-blue-600 dark:text-blue-400">
            Milestones & Accomplishments
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Achievements
          </h2>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({ type: "achievement", title: "", description: "", icon: "FiAward", value: "", label: "" });
                setIsModalOpen(true);
              }}
              className="absolute top-0 right-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
            >
              <FiPlus /> Add Accomplishment
            </button>
          )}
        </div>

        {stats.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {stats.map((stat) => (
              <StatCard 
                key={stat._id} 
                value={stat.value} 
                label={stat.label} 
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                ach={stat}
              />
            ))}
          </motion.div>
        )}

        {achievements.length > 0 && (
          <motion.div
            className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {achievements.map((ach) => (
              <AchievementCard 
                key={ach._id} 
                title={ach.title} 
                description={ach.description} 
                icon={ach.icon} 
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                ach={ach}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Editor Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Achievement / Stat" : "Add Achievement / Stat"}
        onSave={handleSave}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
            >
              <option value="achievement" className="text-black">Achievement / Card</option>
              <option value="stat" className="text-black">Numeric Stat Widget</option>
            </select>
          </div>

          {form.type === "achievement" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Icon Key</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none text-black"
                >
                  <option value="FiAward">FiAward (Ribbon)</option>
                  <option value="FiStar">FiStar (Star)</option>
                  <option value="FiUsers">FiUsers (Hackathon/Team)</option>
                  <option value="FiTrendingUp">FiTrendingUp (Stats/Ratings)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Stat Value (e.g. 130+, Top 5%)</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Stat Label (e.g. Problems Solved)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </>
          )}
        </div>
      </EditModal>
    </section>
  );
}
