import { useState } from "react";
import { motion } from "framer-motion";
import { FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";

const SERVER_URL = "http://localhost:5000";

export default function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/portfolio/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        onLoginSuccess();
      } else {
        setError(data.message || "Invalid admin password.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10"
      >
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <FiLock size={26} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Access Portal</h2>
          <p className="text-slate-400 text-sm mt-1">Enter password to unlock portfolio administration</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <FiAlertCircle className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Unlock Dashboard"}
            {!loading && <FiArrowRight />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
