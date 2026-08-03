"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { navItems } from "@/data/portfolio";

const MOBILE_NAV_QUERY = "(max-width: 760px)";

function formatSingaporeTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [singaporeTime, setSingaporeTime] = useState("--:--");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);
  const restoreFocusFrameRef = useRef(0);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsMenuOpen(false);
    if (restoreFocus) {
      if (restoreFocusFrameRef.current) window.cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = window.requestAnimationFrame(() => {
        restoreFocusFrameRef.current = 0;
        menuButtonRef.current?.focus();
      });
    }
  }, []);

  useEffect(
    () => () => {
      if (restoreFocusFrameRef.current) window.cancelAnimationFrame(restoreFocusFrameRef.current);
    },
    [],
  );

  useEffect(() => {
    const updateClock = () => setSingaporeTime(formatSingaporeTime(new Date()));

    updateClock();
    const clockTimer = window.setInterval(updateClock, 30_000);

    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateHeader = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const activationLine = scrollY + window.innerHeight * 0.35;
      let nextActive = "";

      for (const item of navItems) {
        const section = document.getElementById(item.href.slice(1));
        if (section && section.offsetTop <= activationLine) {
          nextActive = item.href;
        }
      }

      setIsScrolled((current) => {
        const next = scrollY > 30;
        return current === next ? current : next;
      });
      setActiveHref((current) => (current === nextActive ? current : nextActive));
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateHeader();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => firstNavLinkRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const navLinks = Array.from(navigationRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
      const focusable = [menuButtonRef.current, ...navLinks].filter(
        (element): element is HTMLAnchorElement | HTMLButtonElement => element !== null,
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const mobileQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) closeMenu();
    };

    document.addEventListener("keydown", handleKeyDown);
    mobileQuery.addEventListener("change", handleViewportChange);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mobileQuery.removeEventListener("change", handleViewportChange);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className={`site-header${isScrolled ? " scrolled" : ""}`}>
      <a className="brand magnetic" href="#home" aria-label="Reo Tan, home" onClick={() => closeMenu()}>
        <span className="brand-mark">
          R<span>T</span>
        </span>
        <span className="brand-name">
          REO TAN<small>CREATIVE DEVELOPER</small>
        </span>
      </a>

      <nav
        ref={navigationRef}
        id="primary-navigation"
        aria-label="Main navigation"
        className={isMenuOpen ? "open" : undefined}
      >
        {navItems.map((item, index) => (
          <a
            key={item.href}
            ref={index === 0 ? firstNavLinkRef : undefined}
            href={item.href}
            className={activeHref === item.href ? "active" : undefined}
            aria-current={activeHref === item.href ? "location" : undefined}
            onClick={() => closeMenu(isMenuOpen)}
          >
            <i>{item.index}</i>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-side">
        <span className="local-time">
          SGT <b id="localTime">{singaporeTime}</b>
        </span>
        <a className="mini-cta magnetic" href="/assets/Reo-Anthony-Tan-CV.pdf" download>
          RÉSUMÉ <span>↗</span>
        </a>
      </div>

      <button
        ref={menuButtonRef}
        className={`menu-button${isMenuOpen ? " open" : ""}`}
        type="button"
        aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
