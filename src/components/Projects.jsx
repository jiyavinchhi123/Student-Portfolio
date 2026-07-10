import { motion } from "framer-motion";
import finliteImg from "../assets/projects/FinLite.png";
import formfluxImg from "../assets/projects/FormFlux.png";
import resumefitImg from "../assets/projects/ResumeFit.png";
import siyarangImg from "../assets/projects/SiyaRang.png";

const projects = [
  {
    name: "SiyaRang",
    description: "Customized e-commerce platform for a Bandhani store.",
    tech: ["HTML", "CSS", "JS", "Python"],
    features: ["Product catalog", "Custom UI", "Secure storage"],
    demo: "https://www.youtube.com/watch?v=FVvFQQ20D3M",
    repo: "https://github.com/jiyavinchhi123/SiyaRang-Bandhej",
    image: siyarangImg
  },
  {
    name: "ResumeFit",
    description: "Resume-to-job fit scoring with actionable improvements.",
    tech: ["Java", "Python", "Supabase"],
    features: ["Score out of 100", "Suggestions", "Trial model"],
    demo: "https://www.youtube.com/watch?v=wBWmEWm8Bvg",
    repo: "https://github.com/jiyavinchhi123/Job-Fit-Score",
    image: resumefitImg
  },
  {
    name: "FinLite",
    description:
      "Smart finance manager built for modern business owners with automated insights and beautiful reporting.",
    tech: ["React", "Spring Boot", "Supabase", "Python", "Charts"],
    features: [
      "Auto PDF balance sheet generation",
      "Smart predictions with interactive charts",
      "Guided, user-friendly workflows"
    ],
    demo: "https://www.youtube.com/watch?v=TQz-BSR0Dv4&t=15s",
    repo: "https://github.com/jiyavinchhi123/FinLite",
    image: finliteImg
  },
  {
    name: "FormFlux",
    description: "Dynamic form generator with database integration.",
    tech: ["MongoDB", "Java", "JS"],
    features: ["Auto DB creation", "Response tracking", "XLSX export"],
    demo: "https://www.youtube.com/watch?v=MhxHFskRKCw&t=8s",
    repo: "https://github.com/jiyavinchhi123/FormFlux",
    image: formfluxImg
  }
];

function TechBadges({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs px-3 py-1 rounded-full bg-white/80 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/80 dark:border-white/10"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
            Featured Work
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Real-World Projects
          </h2>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {projects.map((project) => (
            <motion.div
              key={project.name}
              className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_16px_32px_rgba(15,23,42,0.08)] shadow-[0_0_24px_rgba(147,197,253,0.45)] dark:shadow-[0_0_24px_rgba(59,130,246,0.45)] p-4 sm:p-6 lg:p-8 grid lg:grid-cols-2 gap-6 lg:gap-8 items-center transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(147,197,253,0.55)] dark:hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-slate-600 dark:text-white/70 mt-2">{project.description}</p>
                </div>
                <TechBadges items={project.tech} />
                <ul className="text-sm text-slate-600 dark:text-white/70 space-y-2">
                  {project.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold rounded-full bg-blue-300 dark:bg-blue-500 text-slate-900 dark:text-white shadow-md transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                  >
                    Live Demo
                  </a>
                  <a
                    href={project.repo}
                    className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 transition hover:shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-200/40 to-purple-200/40 blur-2xl dark:from-blue-500/10 dark:to-purple-500/10" />
                <img
                  src={project.image}
                  alt={project.name}
                  className="relative rounded-2xl w-full h-48 sm:h-64 object-cover shadow-lg dark:shadow-none"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
