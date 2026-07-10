import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import Skills from "../components/Skills.jsx";
import Projects from "../components/Projects.jsx";
import Achievements from "../components/Achievements.jsx";
import Contact from "../components/Contact.jsx";

export default function Home({ theme }) {
  return (
    <main>
      <Hero theme={theme} />
      <About />
      <Skills />
      <Projects />
      <Achievements />
      <Contact />
    </main>
  );
}
