import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import RouteFallback from "./components/RouteFallback.jsx";

// Route-based code splitting using React.lazy()
const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./components/About.jsx"));
const Skills = lazy(() => import("./components/Skills.jsx"));
const Achievements = lazy(() => import("./components/Achievements.jsx"));
const Projects = lazy(() => import("./components/Projects.jsx"));
const Contact = lazy(() => import("./components/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const TaskManagerDemo = lazy(() => import("./components/TaskManagerDemo.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));


const skillList = [
  "C", "C++", "Java", "JavaScript", "PHP", "Python",
  "HTML", "CSS", "React", "Tailwind CSS",
  "Node.js", "Express.js", "Spring Boot",
  "MySQL", "MongoDB", "PostgreSQL", "Supabase",
  "Git", "GitHub", "Vercel", "Render",
  "Algorithms", "Data Structures", "DBMS", "OOP", "Design & Analysis",
  "Communication", "Problem Solving", "Teamwork", "Leadership"
];

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [scroll, setScroll] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAdmin(token === "admin-session-token-998");
  }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Update scroll progress and scroll-to-top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setScroll(0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrollTop / height) * 100 : 0;
      setScroll(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const background = useMemo(
    () =>
      theme === "dark"
        ? "bg-black text-white"
        : "bg-white text-slate-900",
    [theme]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${background} transition-colors duration-500`}>
      <ScrollProgress value={scroll} />
      <Navbar
        onToggleTheme={handleToggleTheme}
        theme={theme}
        isAdmin={isAdmin}
      />
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback theme={theme} />}>
          <Routes>
            <Route path="/" element={<Home theme={theme} isAdmin={isAdmin} />} />
            <Route path="/about" element={<About isAdmin={isAdmin} />} />
            <Route path="/skills" element={<Skills skillList={skillList} isAdmin={isAdmin} />} />
            <Route path="/achievements" element={<Achievements isAdmin={isAdmin} />} />
            <Route path="/projects" element={<Projects isAdmin={isAdmin} />} />
            <Route path="/projects/task-manager" element={<TaskManagerDemo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<AdminLogin onLoginSuccess={() => { setIsAdmin(true); window.location.href = "/"; }} />} />
            <Route path="/tasks" element={isAdmin ? <TaskManagerDemo /> : <Navigate to="/login" />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
