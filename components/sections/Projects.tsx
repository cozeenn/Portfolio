import Image from "next/image";

import { projects } from "@/data/portfolio";

export function Projects() {
  return (
    <section className="projects section-shell relative" id="projects" aria-labelledby="projects-title">
      <div className="section-heading reveal">
        <div className="eyebrow mono">
          <span>02</span> SELECTED / PROJECTS
        </div>
        <p className="section-code mono">[ RECENT DEPLOYMENTS — {projects.length.toString().padStart(2, "0")} ]</p>
      </div>

      <div className="projects-title reveal">
        <h2 id="projects-title">
          Selected <em>work</em>
        </h2>
        <p>Three live products. Three different problems. One focus: experiences that work beautifully.</p>
      </div>

      <div className="project-stack">
        {projects.map((project) => {
          const fullTitle = `${project.title} ${project.secondaryTitle}`;

          return (
            <article
              className={`project-card${project.reverse ? " reverse" : ""} reveal`}
              data-cursor="VIEW"
              data-tilt
              key={project.url}
            >
              <a
                className="project-visual"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${fullTitle} live website`}
              >
                <Image
                  src={project.image}
                  alt={`${fullTitle} website homepage`}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1050px) 58vw, 68vw"
                />
                <div className="project-shade" aria-hidden="true" />
                <span className="project-chip mono">LIVE WEBSITE ↗</span>
              </a>

              <div className="project-copy">
                <div className="project-meta mono">
                  <span>{project.index}</span>
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
                <h3>
                  {project.title} <span>{project.secondaryTitle}</span>
                </h3>
                <p>{project.description}</p>
                <div className="project-footer">
                  <ul>
                    {project.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <span className="project-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
