import { useEffect } from "react";

// Keep the supplied GIF intact: 220 frames, one 9.46-second pass, no loop.
const INTRO_DURATION_MS = 9460;

export default function Entrance() {
  useEffect(() => {
    const splash = document.getElementById("go-intro");
    if (!splash) return;
    const image = splash.querySelector(".go-intro-image");
    const skip = splash.querySelector(".go-intro-skip");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let finished = false, started = false, leaving = false;
    let playTimer, exitTimer, safetyTimer;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(playTimer);
      clearTimeout(exitTimer);
      clearTimeout(safetyTimer);
      image?.removeEventListener("load", onLoad);
      image?.removeEventListener("error", dismiss);
      skip?.removeEventListener("click", dismiss);
      splash.removeEventListener("animationend", onEnd);
      window.removeEventListener("keydown", onKey);
      motion.removeEventListener("change", onMotion);
      document.documentElement.classList.remove("go-entering");
      document.getElementById("root")?.removeAttribute("inert");
      const restoreFocus = splash.contains(document.activeElement);
      splash.remove();
      if (restoreFocus) document.querySelector(".welcome-actions button")?.focus();
    };
    const dismiss = () => {
      if (finished || leaving) return;
      leaving = true;
      clearTimeout(playTimer);
      splash.classList.add("go-intro-leaving");
      exitTimer = setTimeout(finish, 300);
    };
    const onLoad = () => {
      if (started || finished || leaving) return;
      started = true;
      splash.classList.add("go-intro-ready");
      playTimer = setTimeout(dismiss, INTRO_DURATION_MS);
    };
    const onEnd = event => {
      if (event.target === splash && event.animationName === "go-intro-out") finish();
    };
    const onKey = event => { if (event.key === "Escape") dismiss(); };
    const onMotion = event => { if (event.matches) finish(); };
    if (motion.matches) {
      finish();
      return;
    }
    splash.addEventListener("animationend", onEnd);
    window.addEventListener("keydown", onKey);
    motion.addEventListener("change", onMotion);
    skip?.addEventListener("click", dismiss);
    image?.addEventListener("load", onLoad);
    image?.addEventListener("error", dismiss);
    safetyTimer = setTimeout(dismiss, 18000);
    if (image?.complete) {
      if (image.naturalWidth) onLoad();
      else dismiss();
    }
    return finish;
  }, []);
  return null;
}
