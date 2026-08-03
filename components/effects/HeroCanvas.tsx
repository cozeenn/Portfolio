"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -1_000, y: -1_000 };
    const pointerSurface = canvas.parentElement ?? canvas;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let animationFrame = 0;
    let isRunning = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(65, Math.max(28, Math.floor(width / 24)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
      }));
    };

    const draw = () => {
      if (!isRunning) {
        animationFrame = 0;
        return;
      }

      context.clearRect(0, 0, width, height);

      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (pointerDistance < 150) {
          point.x += (point.x - pointer.x) * 0.004;
          point.y += (point.y - pointer.y) * 0.004;
        }

        context.fillStyle = index % 9 === 0 ? "rgba(199,255,46,.75)" : "rgba(255,255,255,.24)";
        context.beginPath();
        context.arc(point.x, point.y, index % 9 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
        context.fill();

        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
          const other = points[otherIndex];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance >= 115) continue;

          context.strokeStyle = `rgba(255,255,255,${(1 - distance / 115) * 0.07})`;
          context.lineWidth = 0.5;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      isRunning = false;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const start = () => {
      if (isRunning || reducedMotion.matches || document.hidden) return;
      isRunning = true;
      animationFrame = window.requestAnimationFrame(draw);
    };

    const syncMotion = () => {
      if (reducedMotion.matches) {
        stop();
        context.clearRect(0, 0, width, height);
      } else {
        start();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const resetPointer = () => {
      pointer.x = -1_000;
      pointer.y = -1_000;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    pointerSurface.addEventListener("pointermove", handlePointerMove, { passive: true });
    pointerSurface.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", syncMotion);
    resize();
    syncMotion();

    return () => {
      stop();
      resizeObserver.disconnect();
      pointerSurface.removeEventListener("pointermove", handlePointerMove);
      pointerSurface.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", syncMotion);
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas ref={canvasRef} id="networkCanvas" aria-hidden="true" />;
}
