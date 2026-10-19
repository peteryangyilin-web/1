import { useEffect } from "react";

// The splash lives in index.html so the first paint is already the GO mark.
export default function Entrance() {
  useEffect(() => {
    const splash = document.getElementById("go-intro");
    if (!splash) return;
    let finished = false,
      startTimer;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(startTimer);
      document.documentElement.classList.remove("go-entering");
      document.getElementById("root")?.removeAttribute("inert");
      splash.remove();
      window.removeEventListener("keydown", onKey);
      motion.removeEventListener("change", onMotion);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish();
    };
    const onMotion = (event) => {
      if (event.matches) finish();
    };
    const onEnd = (e) => {
      if (e.target === splash && e.animationName === "go-intro-out") finish();
    };
    splash.addEventListener("animationend", onEnd);
    window.addEventListener("keydown", onKey);
    motion.addEventListener("change", onMotion);
    // Wait briefly for the bundled logo font, with a firm upper limit.
    if (motion.matches) {
      startTimer = setTimeout(finish, 100);
    } else {
      const fontReady = document.fonts?.ready || Promise.resolve();
      Promise.race([
        fontReady,
        new Promise((resolve) => {
          startTimer = setTimeout(resolve, 350);
        }),
      ]).then(() => {
        if (!finished) splash.classList.add("go-intro-running");
      });
    }
    const safety = setTimeout(finish, 2800);
    return () => {
      clearTimeout(safety);
      splash.removeEventListener("animationend", onEnd);
      window.removeEventListener("keydown", onKey);
      finish();
    };
  }, []);
  return null;
}
