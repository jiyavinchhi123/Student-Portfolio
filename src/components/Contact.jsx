import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "./SectionTitle";
import Card from "./Card";
import Button from "./Button";
import { FiGithub, FiLinkedin, FiMail, FiHelpCircle } from "react-icons/fi";

export default function Contact() {
  const email = "jiya.vinchhi2412@gmail.com";
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  // Controlled form states
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData();
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE");
    formData.append("redirect", `${window.location.origin}/#contact`);
    formData.append("subject", "New portfolio contact message");
    formData.append("from_name", "Jiya Vinchhi Portfolio");
    formData.append("name", name);
    formData.append("email", emailInput);
    formData.append("message", message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        // Clear controlled inputs on success
        setName("");
        setEmailInput("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 5000); // reset status after 5s
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
    <section id="contact" className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle title="Contact Me" subtitle="Let's Connect" />
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8">
          <Card className="!shadow-[0_0_18px_rgba(147,197,253,0.35)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.6)]">
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
                  className="overflow-hidden mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
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

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
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

            {/* Real-time typing display (Live preview) */}
            {(name || emailInput || message) && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-white/60 space-y-2 shadow-inner">
                <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 dark:text-white/30">Live Preview</p>
                {name && (
                  <p>
                    <strong>Name:</strong> {name}
                  </p>
                )}
                {emailInput && (
                  <p>
                    <strong>Email:</strong> {emailInput}
                  </p>
                )}
                {message && (
                  <p className="whitespace-pre-wrap">
                    <strong>Message:</strong> {message}
                  </p>
                )}
              </div>
            )}
          </Card>
          <div className="space-y-4">
            <Card className="!shadow-[0_0_18px_rgba(147,197,253,0.35)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.6)]">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Email Me</h3>
              <p className="text-slate-600 dark:text-white/70 mt-2">
                Use the form to send a message directly to my inbox.
              </p>
            </Card>
            <Card className="!shadow-[0_0_18px_rgba(147,197,253,0.35)] dark:!shadow-[0_0_28px_rgba(59,130,246,0.6)]">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Social Links</h3>
              <div className="mt-4 flex items-center gap-4 text-slate-600 dark:text-white/70">
                <a className="hover:text-cyan-500 dark:hover:text-cyan-300 transition" href="https://github.com/jiyavinchhi123" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FiGithub size={20} />
                </a>
                <a className="hover:text-cyan-500 dark:hover:text-cyan-300 transition" href="https://linkedin.com/in/jiya-vinchhi-a75678332/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FiLinkedin size={20} />
                </a>
                <a className="hover:text-cyan-500 dark:hover:text-cyan-300 transition" href={`mailto:${email}`} aria-label="Email">
                  <FiMail size={20} />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
