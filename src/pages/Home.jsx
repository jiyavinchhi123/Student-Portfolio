import Header from "../components/Header.jsx";

export default function Home({ theme, isAdmin }) {
  return (
    <div className="space-y-0">
      <Header
        name="JIYA"
        themeColor={theme === "dark" ? "#60a5fa" : "#2563eb"}
        theme={theme}
        isAdmin={isAdmin}
      />
    </div>
  );
}

