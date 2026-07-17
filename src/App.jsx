import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Home from "./pages/Home.jsx";
import About from "./components/About.jsx";
import Skills from "./components/Skills.jsx";
import Achievements from "./components/Achievements.jsx";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

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
  const location = useLocation();

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
        ? "bg-[#0a0a0a] text-white"
        : "bg-slate-50 text-slate-900",
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
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills skillList={skillList} />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
