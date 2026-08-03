import Image from "next/image";
import { Fragment } from "react";

import HeroCanvas from "@/components/effects/HeroCanvas";
import { services } from "@/data/portfolio";

export function Hero() {
  return (
    <>
      <section className="hero relative isolate" id="home" aria-labelledby="hero-title">
        <HeroCanvas />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-index mono">PORTFOLIO / 2026</div>

        <div className="hero-copy">
          <div className="availability reveal">
            <span /> AVAILABLE FOR SELECT PROJECTS
          </div>

          <h1 id="hero-title" aria-label="Digital creative developer">
            <span className="line reveal">
              <span>DIGITAL</span>
            </span>
            <span className="line outline reveal">
              <span>CREATIVE</span>
            </span>
            <span className="line indent reveal">
              <span>DEVELOPER</span>
              <sup>®</sup>
            </span>
          </h1>

          <div className="hero-bottom reveal">
            <p>
              I build sharp, responsive digital experiences where <strong>code</strong>,{" "}
              <strong>design</strong>, and <strong>story</strong> move as one.
            </p>
            <a href="#projects" className="circle-button magnetic" aria-label="Explore selected work">
              <span>
                EXPLORE
                <br />
                WORK
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v15M6 13l6 6 6-6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-portrait reveal" data-tilt>
          <div className="portrait-hud top">
            <span>SUBJECT_01</span>
            <span>PH / 14.5995° N</span>
          </div>
          <div className="portrait-frame">
            <Image
              src="/assets/reo-enhanced-cutout.png"
              alt="Reo Anthony Tan, creative developer"
              fill
              preload
              quality={92}
              sizes="(max-width: 760px) 90vw, (max-width: 1050px) 45vw, 500px"
            />
            <div className="scan-line" aria-hidden="true" />
            <span className="corner c1" aria-hidden="true" />
            <span className="corner c2" aria-hidden="true" />
            <span className="corner c3" aria-hidden="true" />
            <span className="corner c4" aria-hidden="true" />
          </div>
          <div className="portrait-hud bottom">
            <span className="status-dot" aria-hidden="true" />
            <b>WEB_DEV</b>
            <b>UI/UX</b>
            <b>VISUAL</b>
          </div>
          <div className="orbit-label">
            DESIGNING THE
            <br />
            UNEXPECTED <span>✦</span>
          </div>
        </div>

        <div className="hero-rail mono" aria-hidden="true">
          <span>SCROLL TO INITIATE</span>
          <i />
          <b>01</b>
        </div>
      </section>

      <section className="signal-strip w-full" aria-label="Services">
        <div className="signal-track">
          {[false, true].map((isDuplicate) => (
            <div className="signal-sequence" aria-hidden={isDuplicate || undefined} key={String(isDuplicate)}>
              {services.map((service) => (
                <Fragment key={service}>
                  <span>{service}</span>
                  <i aria-hidden="true">✦</i>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
