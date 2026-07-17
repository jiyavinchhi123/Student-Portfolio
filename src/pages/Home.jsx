import Header from "../components/Header.jsx";
import About from "../components/About.jsx";
import Skills from "../components/Skills.jsx";
import Achievements from "../components/Achievements.jsx";

export default function Home({ theme, skillList }) {
  return (
    <>
      <Header
        name="JIYA"
        themeColor={theme === "dark" ? "#60a5fa" : "#2563eb"}
        theme={theme}
      />
      <About />
      <Skills skillList={skillList} />
      <Achievements />
    </>
  );
}
