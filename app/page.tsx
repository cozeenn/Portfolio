import GlobalEffects from "@/components/effects/GlobalEffects";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Expertise } from "@/components/sections/Expertise";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import PortfolioAssistant from "@/components/ui/PortfolioAssistant";
import SiteHeader from "@/components/ui/SiteHeader";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <GlobalEffects />
      <SiteHeader />

      <main className="relative z-[1]" id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <Projects />
        <TechStack />
        <Expertise />
        <Contact />
      </main>

      <PortfolioAssistant />
    </>
  );
}
