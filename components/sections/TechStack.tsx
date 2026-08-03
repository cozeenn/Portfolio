"use client";

import type { CSSProperties, PointerEvent } from "react";

import { technologies } from "@/data/portfolio";

const stackGroupDefinitions = [
  { index: "01", label: "DEVELOPMENT", categories: ["FRAMEWORK", "LANGUAGE", "STYLING", "BACKEND", "DATA"] },
  { index: "02", label: "AI INTEGRATION", categories: ["AI"] },
  { index: "03", label: "DESIGN", categories: ["DESIGN"] },
  { index: "04", label: "WORKFLOW", categories: ["WORKFLOW", "DEPLOY"] },
];

const stackGroups = stackGroupDefinitions.map((group) => ({
  ...group,
  count: technologies
    .filter((technology) => group.categories.includes(technology.category))
    .length.toString()
    .padStart(2, "0"),
}));

type TechCardStyle = CSSProperties & {
  "--tech-accent": string;
};

function updateCardGlow(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
  card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
}

export function TechStack() {
  return (
    <section className="tech-stack section-shell relative" id="stack" aria-labelledby="stack-title">
      <div className="section-heading reveal">
        <div className="eyebrow mono">
          <span>03</span> TECHNOLOGY / STACK
        </div>
        <p className="section-code mono">[ TOOLS IN ACTIVE ROTATION ]</p>
      </div>

      <div className="stack-intro reveal">
        <h2 id="stack-title">
          The stack behind
          <br />
          <em>the experience.</em>
        </h2>
        <div className="stack-intro-copy">
          <span className="mono">SYSTEM_CAPABILITIES</span>
          <p>
            A practical toolkit for designing interfaces, building responsive products, managing data,
            and delivering polished visual content.
          </p>
        </div>
      </div>

      <div className="stack-console reveal">
        <div className="stack-console-bar mono">
          <div>
            <i />
            <i />
            <i />
            <span>reo@portfolio:~/tech-stack</span>
          </div>
          <b>
            <span /> SYSTEM ONLINE
          </b>
        </div>

        <div className="stack-layout">
          <div className="stack-grid">
            {technologies.map((technology) => (
              <article
                className="tech-card"
                data-accent={technology.accent}
                key={technology.name}
                onPointerMove={updateCardGlow}
                style={{ "--tech-accent": technology.accent } as TechCardStyle}
              >
                <span className="tech-index mono">{technology.index}</span>
                <div className="tech-symbol">{technology.symbol}</div>
                <div>
                  <h3>{technology.name}</h3>
                  <p>{technology.description}</p>
                </div>
                <small className="mono">{technology.category}</small>
              </article>
            ))}
          </div>

          <aside className="stack-readout" aria-label="Technology stack summary">
            <div className="readout-head mono">
              <span>STACK_MATRIX</span>
              <b>{technologies.length} MODULES</b>
            </div>
            <div className="stack-rings" aria-hidden="true">
              <i />
              <i />
              <i />
              <b>RT</b>
            </div>
            <div className="stack-groups">
              {stackGroups.map((group) => (
                <div key={group.label}>
                  <span>{group.index}</span>
                  <p>{group.label}</p>
                  <b>{group.count}</b>
                </div>
              ))}
            </div>
            <p className="stack-note mono">Always learning. Always refining the system.</p>
          </aside>
        </div>

        <div className="stack-command mono">
          <span>$</span> stack --list --status=active <i />
          <b>{technologies.length} technologies loaded</b>
        </div>
      </div>
    </section>
  );
}
