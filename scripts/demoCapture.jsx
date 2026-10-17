// Development-only renderer used by generate-exercise-gifs.mjs, not an app route.
import React from "react";
import { createRoot } from "react-dom/client";
import { CatAnimation } from "../src/components/ExerciseDemo";
import { EXERCISE_DEMOS } from "../src/exerciseDemos";
let root;
export function renderDemo(id) {
  if (!root) {
    const host = document.createElement("div");
    host.className = "capture-host";
    host.style.cssText = "width:300px;height:220px;position:fixed;inset:0;";
    document.body.replaceChildren(host);
    document.body.style.cssText = "margin:0;background:#f6f8f1;";
    root = createRoot(host);
  }
  root.render(<CatAnimation key={id} demo={EXERCISE_DEMOS[id]} paused />);
}
