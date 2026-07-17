import Header from "../components/Header.jsx";

export default function Home({ theme }) {
  return (
    <Header
      name="JIYA"
      themeColor={theme === "dark" ? "#60a5fa" : "#2563eb"}
      theme={theme}
    />
  );
}
