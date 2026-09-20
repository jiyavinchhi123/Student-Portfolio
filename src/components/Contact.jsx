import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "./SectionTitle";
import Card from "./Card";
import Button from "./Button";
import { FiGithub, FiLinkedin, FiMail, FiHelpCircle, FiEdit2 } from "react-icons/fi";
import EditModal from "./EditModal";

const SERVER_URL = "http://localhost:5000";

export default function Contact({ isAdmin }) {
  const [contactData, setContactData] = useState({
    email: "jiya.vinchhi2412@gmail.com",
    github: "https://github.com/jiyavinchhi123",
    linkedin: "https://linkedin.com/in/jiya-vinchhi-a75678332/"
  });

  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  // Controlled form states
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...contactData });

  const fetchContact = () => {
    fetch(`${SERVER_URL}/portfolio/contact`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setContactData(data);
          setFormData({
            email: data.email || "",
            github: data.github || "",
            linkedin: data.linkedin || ""
          });
        }
      })
      .catch(err => console.error("Error loading contact:", err));
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSaveContact = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/portfolio/contact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      // Contact is stored under profile on backend, let's also update the contact document
      // Wait, on the backend we added GET /portfolio/contact and it seeds/returns Contact model.
      // Let's make sure we support PUT /portfolio/contact in server.js!
      // Wait! Did we add PUT /portfolio/contact? Let's check server.js. No, we only added GET /portfolio/contact!
      // Let's add PUT /portfolio/contact on the backend. Yes, we should! Let's do that in a moment.
      const putRes = await fetch(`${SERVER_URL}/portfolio/contact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (putRes.ok) {
        setIsModalOpen(false);
        fetchContact();
      } else {
        alert("Failed to update contact information.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const formPayload = new FormData();
    formPayload.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE");
    formPayload.append("redirect", `${window.location.origin}/#contact`);
    formPayload.append("subject", "New portfolio contact message");
    formPayload.append("from_name", "Jiya Vinchhi Portfolio");
    formPayload.append("name", name);
    formPayload.append("email", emailInput);
    formPayload.append("message", message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formPayload
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmailInput("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="section-padding relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="relative">
          <SectionTitle title="Contact Me" subtitle="Let's Connect" />
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-0 right-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
            >
              <FiEdit2 /> Edit Contact Info
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            viewport={{ once: true, amount: 0.15 }}
          >
            <Card className="!shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.45)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Send Message</h3>
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
                  aria-label="Toggle contact help tooltip"
                >
                  <FiHelpCircle className="text-sm" />
                  {showTooltip ? "Hide Help" : "Need Help?"}
                </button>
              </div>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  >
                    <p className="font-semibold">Quick Tips:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Double check that your email address is correct.</li>
                      <li>Briefly specify your request (collaboration, hiring, project discussion).</li>
                      <li>I typically respond within 24-48 hours.</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 font-medium">Name</label>
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all duration-300"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all duration-300"
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-white/70 font-medium">Message</label>
                    <span className={`text-xs ${message.length >= 450 ? "text-red-500 font-bold" : "text-slate-400 dark:text-white/40"}`}>
                      {message.length} / 500 characters
                    </span>
                  </div>
                  <textarea
                    name="message"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                    className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all duration-300"
                    placeholder="Tell me about your project"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </Button>
                </div>
                {status === "success" && (
                  <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-semibold text-center shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-pulse">
                    Message sent successfully! ❤️
                  </div>
                )}
                {status === "error" && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold text-center shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    Something went wrong. Please try again.
                  </div>
                )}
              </form>
            </Card>
          </motion.div>
          
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.15 }}
            viewport={{ once: true, amount: 0.15 }}
          >
            <Card className="!shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.45)]">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Email Me</h3>
              <p className="text-slate-600 dark:text-white/70 mt-2">
                Use the form to send a message directly to my inbox.
              </p>
            </Card>
            <Card className="!shadow-[0_0_24px_rgba(59,130,246,0.15)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.45)]">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Social Links</h3>
              <div className="mt-4 flex items-center gap-4 text-slate-600 dark:text-white/70">
                <a className="hover:text-blue-500 dark:hover:text-blue-400 transition" href={contactData.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FiGithub size={20} />
                </a>
                <a className="hover:text-blue-500 dark:hover:text-blue-400 transition" href={contactData.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FiLinkedin size={20} />
                </a>
                <a className="hover:text-blue-500 dark:hover:text-blue-400 transition" href={`mailto:${contactData.email}`} aria-label="Email">
                  <FiMail size={20} />
                </a>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Editor Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Contact Information"
        onSave={handleSaveContact}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub Profile Link</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn Profile Link</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 text-sm focus:outline-none"
              required
            />
          </div>
        </div>
      </EditModal>
    </section>
  );
}
