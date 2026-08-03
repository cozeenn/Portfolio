"use client";

import { useEffect, useState } from "react";

type LoaderState = {
  progress: number;
  done: boolean;
  hidden: boolean;
};

function elementClosest(target: EventTarget | null, selector: string) {
  return target instanceof Element ? target.closest<HTMLElement>(selector) : null;
}

export default function GlobalEffects() {
  const [loader, setLoader] = useState<LoaderState>({ progress: 0, done: false, hidden: false });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let progress = 0;
    let finished = false;
    let loadTimer = 0;
    let finishTimer = 0;
    let safetyTimer = 0;
    let dismissTimer = 0;
    const skipIntro = reducedMotion || Boolean(window.location.hash && window.location.hash !== "#home");

    const finishLoader = (immediate = false) => {
      if (finished) return;
      finished = true;
      if (loadTimer) window.clearInterval(loadTimer);
      if (finishTimer) window.clearTimeout(finishTimer);
      if (safetyTimer) window.clearTimeout(safetyTimer);
      setLoader({ progress: 100, done: true, hidden: immediate });
      document.body.classList.remove("loading");
      if (immediate) return;
      dismissTimer = window.setTimeout(
        () => setLoader({ progress: 100, done: true, hidden: true }),
        700,
      );
    };

    document.body.classList.add("loading");

    if (skipIntro) {
      finishTimer = window.setTimeout(() => finishLoader(true), 0);
    } else {
      loadTimer = window.setInterval(() => {
        progress = Math.min(100, progress + Math.ceil(Math.random() * 12));
        setLoader({ progress, done: false, hidden: false });

        if (progress === 100) {
          window.clearInterval(loadTimer);
          loadTimer = 0;
          finishTimer = window.setTimeout(finishLoader, 280);
        }
      }, 55);
      safetyTimer = window.setTimeout(finishLoader, 1_800);
    }

    return () => {
      finished = true;
      if (loadTimer) window.clearInterval(loadTimer);
      if (finishTimer) window.clearTimeout(finishTimer);
      if (safetyTimer) window.clearTimeout(safetyTimer);
      if (dismissTimer) window.clearTimeout(dismissTimer);
      document.body.classList.remove("loading");
    };
  }, []);

  useEffect(() => {
    if (!loader.done) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const heroReveals = document.querySelectorAll<HTMLElement>(".hero .reveal");

    heroReveals.forEach((element, index) => {
      const timer = window.setTimeout(
        () => element.classList.add("visible"),
        reducedMotion ? 0 : 80 * index,
      );
      timers.push(timer);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [loader.done]);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.hero .reveal)"),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealHashTarget = (restoreInitialPosition = false) => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      let id = hash;
      try {
        id = decodeURIComponent(hash);
      } catch {
        // Keep the raw hash when it contains malformed escape sequences.
      }

      const target = document.getElementById(id);
      target?.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
        element.classList.add("visible");
      });

      if (target && restoreInitialPosition) {
        const root = document.documentElement;
        const previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        target.scrollIntoView({ block: "start" });
        root.style.scrollBehavior = previousBehavior;
      }
    };

    revealHashTarget(true);
    const handleHashChange = () => revealHashTarget(false);
    window.addEventListener("hashchange", handleHashChange);

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => element.classList.add("visible"));
      return () => window.removeEventListener("hashchange", handleHashChange);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const progressBar = document.querySelector<HTMLElement>(".scroll-progress span");
    const year = document.getElementById("year");
    let frame = 0;

    if (year) year.textContent = String(new Date().getFullYear());

    const updateScroll = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollY / maxScroll) * 100)) : 0;

      if (progressBar) progressBar.style.width = `${percentage}%`;
      document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateScroll();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    const ringLabel = ring?.querySelector<HTMLElement>("span");
    let enabled = false;
    let cursorFrame = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let activeMagnetic: HTMLElement | null = null;
    let activeTilt: HTMLElement | null = null;

    const resetInteractiveElements = () => {
      if (activeMagnetic) activeMagnetic.style.transform = "";
      if (activeTilt) activeTilt.style.transform = "";
      activeMagnetic = null;
      activeTilt = null;
      ring?.classList.remove("project-hover");
    };

    const hideCursor = () => {
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
      resetInteractiveElements();
    };

    const renderCursor = () => {
      if (!enabled || !ring) {
        cursorFrame = 0;
        return;
      }

      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const size = ring.classList.contains("project-hover") ? 76 : 42;
      ring.style.transform = `translate3d(${ringX - size / 2}px,${ringY - size / 2}px,0)`;
      cursorFrame = window.requestAnimationFrame(renderCursor);
    };

    const syncEffects = () => {
      const shouldEnable = finePointer.matches && !reducedMotion.matches;
      if (shouldEnable === enabled) return;
      enabled = shouldEnable;

      if (enabled) {
        cursorFrame = window.requestAnimationFrame(renderCursor);
      } else {
        if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
        cursorFrame = 0;
        hideCursor();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled) return;

      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dot) {
        dot.style.opacity = "1";
        dot.style.transform = `translate3d(${mouseX - 2.5}px,${mouseY - 2.5}px,0)`;
      }
      if (ring) ring.style.opacity = "1";

      const cursorTarget = elementClosest(event.target, "[data-cursor]");
      ring?.classList.toggle("project-hover", Boolean(cursorTarget));
      if (ringLabel) ringLabel.textContent = cursorTarget?.dataset.cursor || "VIEW";

      const magneticTarget = elementClosest(event.target, ".magnetic");
      if (activeMagnetic && activeMagnetic !== magneticTarget) activeMagnetic.style.transform = "";
      activeMagnetic = magneticTarget;
      if (magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        magneticTarget.style.transform = `translate(${x * 0.14}px,${y * 0.14}px)`;
      }

      const tiltTarget = elementClosest(event.target, "[data-tilt]");
      if (activeTilt && activeTilt !== tiltTarget) activeTilt.style.transform = "";
      activeTilt = tiltTarget;
      if (tiltTarget) {
        const rect = tiltTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const strength = tiltTarget.classList.contains("hero-portrait") ? 5 : 1.2;
        tiltTarget.style.transform = `perspective(1200px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) hideCursor();
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideCursor);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", hideCursor);
    finePointer.addEventListener("change", syncEffects);
    reducedMotion.addEventListener("change", syncEffects);
    syncEffects();

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", hideCursor);
      finePointer.removeEventListener("change", syncEffects);
      reducedMotion.removeEventListener("change", syncEffects);
      enabled = false;
      if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
      hideCursor();
    };
  }, []);

  return (
    <>
      {!loader.hidden ? (
        <div className={`loader${loader.done ? " done" : ""}`} aria-hidden="true">
          <div className="loader-mark">
            RT<span>.</span>
          </div>
          <div className="loader-track">
            <i style={{ width: `${loader.progress}%` }} />
          </div>
          <div className="loader-meta">
            <span>LOADING PORTFOLIO</span>
            <b>{String(loader.progress).padStart(3, "0")}</b>
          </div>
        </div>
      ) : null}

      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true">
        <span>VIEW</span>
      </div>
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
    </>
  );
}
