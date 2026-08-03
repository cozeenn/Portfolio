import type { ExpertiseItem, NavItem, Project, Technology } from "@/types/portfolio";

export const navItems: NavItem[] = [
  { index: "01", label: "About", href: "#about" },
  { index: "02", label: "Projects", href: "#projects" },
  { index: "03", label: "Stack", href: "#stack" },
  { index: "04", label: "Expertise", href: "#expertise" },
  { index: "05", label: "Contact", href: "#contact" },
];

export const services = ["WEB DEVELOPMENT", "UI/UX DESIGN", "CREATIVE DIRECTION", "CONTENT DESIGN"];

export const projects: Project[] = [
  {
    index: "01 / 03",
    category: "BUSINESS PLATFORM",
    year: "2026",
    title: "JS",
    secondaryTitle: "VirtuAssist",
    description: "A conversion-focused service platform that positions a virtual assistance brand with clarity, confidence, and professional polish.",
    image: "/assets/js-virtuassist.png",
    url: "https://jsvirtuassist.vercel.app/#top",
    tags: ["UI/UX", "Responsive Build", "Frontend"],
  },
  {
    index: "02 / 03",
    category: "HOSPITALITY",
    year: "2026",
    title: "Carlito’s",
    secondaryTitle: "Resort",
    description: "A welcoming destination website that turns discovery into action, helping guests explore the venue and plan their escape.",
    image: "/assets/carlitos-resort.png",
    url: "https://carlitos-swimming-pool-resort.ct.ws/",
    tags: ["Web Design", "Mobile UX", "Development"],
    reverse: true,
  },
  {
    index: "03 / 03",
    category: "WEB APPLICATION",
    year: "2026",
    title: "Life",
    secondaryTitle: "Tag",
    description: "A digital identity experience built around accessible essential information, practical utility, and a focused modern interface.",
    image: "/assets/lifetag.png",
    url: "https://cozeenn.github.io/lifetag/",
    tags: ["Product Design", "UI/UX", "Web App"],
  },
];

export const technologies: Technology[] = [
  { index: "01", symbol: "NX", name: "Next.js", description: "Full-stack React framework", category: "FRAMEWORK", accent: "#ffffff" },
  { index: "02", symbol: "RE", name: "React", description: "Component-driven interfaces", category: "FRAMEWORK", accent: "#61dafb" },
  { index: "03", symbol: "TS", name: "TypeScript", description: "Type-safe application code", category: "LANGUAGE", accent: "#3178c6" },
  { index: "04", symbol: "TW", name: "Tailwind CSS", description: "Responsive design system", category: "STYLING", accent: "#06b6d4" },
  { index: "05", symbol: "JS", name: "JavaScript", description: "Interaction and browser logic", category: "LANGUAGE", accent: "#f7df1e" },
  { index: "06", symbol: "GQ", name: "Groq API", description: "Fast AI assistant responses", category: "AI", accent: "#f55036" },
  { index: "07", symbol: "PHP", name: "PHP", description: "Server-side development", category: "BACKEND", accent: "#777bb4" },
  { index: "08", symbol: "SQL", name: "MySQL", description: "Relational data systems", category: "DATA", accent: "#4479a1" },
  { index: "09", symbol: "GH", name: "Git & GitHub", description: "Versioning and collaboration", category: "WORKFLOW", accent: "#f05032" },
  { index: "10", symbol: "FI", name: "Figma", description: "Interface design and prototypes", category: "DESIGN", accent: "#a259ff" },
  { index: "11", symbol: "PS", name: "Photoshop", description: "Visual production and assets", category: "DESIGN", accent: "#31a8ff" },
  { index: "12", symbol: "VX", name: "Vercel", description: "Continuous web deployment", category: "DEPLOY", accent: "#c7ff2e" },
];

export const expertise: ExpertiseItem[] = [
  { index: "01", title: "Web Development", tools: "Next.js / React / TypeScript / Tailwind CSS" },
  { index: "02", title: "Interface Design", tools: "Figma / Prototyping / Responsive UI / UX" },
  { index: "03", title: "AI & Backend", tools: "Groq API / Route Handlers / PHP / MySQL" },
  { index: "04", title: "Visual Content", tools: "Photoshop / Premiere Pro / CapCut / Brand Assets" },
];
