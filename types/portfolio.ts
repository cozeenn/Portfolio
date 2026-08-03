export type NavItem = {
  index: string;
  label: string;
  href: `#${string}`;
};

export type Project = {
  index: string;
  category: string;
  year: string;
  title: string;
  secondaryTitle: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
  reverse?: boolean;
};

export type Technology = {
  index: string;
  symbol: string;
  name: string;
  description: string;
  category:
    | "FRAMEWORK"
    | "LANGUAGE"
    | "STYLING"
    | "AI"
    | "BACKEND"
    | "DATA"
    | "WORKFLOW"
    | "DESIGN"
    | "DEPLOY";
  accent: string;
};

export type ExpertiseItem = {
  index: string;
  title: string;
  tools: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
