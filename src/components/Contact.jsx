import { useState } from "react";
import SectionTitle from "./SectionTitle";
import Card from "./Card";
import Button from "./Button";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Contact() {
  const email = "jiya.vinchhi2412@gmail.com";
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        e.target.reset(); // clear inputs
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
            <form
              className="space-y-4"
              action="https://api.web3forms.com/submit"
              method="POST"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="access_key" value={import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE"} />
              <input type="hidden" name="redirect" value={`${window.location.origin}/#contact`} />
              <input type="hidden" name="subject" value="New portfolio contact message" />
              <input type="hidden" name="from_name" value="Jiya Vinchhi Portfolio" />
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
              <div>
                <label className="text-sm text-slate-600 dark:text-white/70">Name</label>
                <input
                  name="name"
                  type="text"
                  className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 dark:text-white/70">Email</label>
                <input
                  name="email"
                  type="email"
                  className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white"
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 dark:text-white/70">Message</label>
                <textarea
                  name="message"
                  rows="4"
                  className="mt-2 w-full rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 px-4 py-3 text-slate-900 dark:text-white"
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
