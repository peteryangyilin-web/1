import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { EXERCISE_DEMOS } from "../src/exerciseDemos.js";
const scratch = mkdtempSync(join(tmpdir(), "go-cat-frames-"));
const output = resolve("public/exercises");
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 340, height: 250 },
    deviceScaleFactor: 1,
  });
  await page.goto(process.env.BASE_URL || "http://localhost:5173");
  await page.evaluate(async () => {
    const portrait = new Image();
    portrait.src = "/cat-coach/portrait.png";
    await portrait.decode();
  });
  for (const [id, demo] of Object.entries(EXERCISE_DEMOS)) {
    if (process.argv.length > 2 && !process.argv.slice(2).includes(id))
      continue;
    const dir = join(scratch, id);
    mkdirSync(dir);
    await page.evaluate(async (id) => {
      const { renderDemo } = await import("/scripts/demoCapture.jsx");
      renderDemo(id);
    }, id);
    const svg = page.locator(".capture-host svg");
    await svg.waitFor();
    await page.waitForTimeout(35);
    const count = Math.ceil(demo.duration * 10);
    for (let frame = 0; frame < count; frame++) {
      await svg.evaluate((node, time) => {
        node.pauseAnimations();
        node.setCurrentTime(time);
      }, frame / 10);
      await svg.screenshot({
        path: join(dir, `${String(frame).padStart(3, "0")}.png`),
      });
    }
    execFileSync("python", [
      "-c",
      `from PIL import Image
from pathlib import Path
import sys
paths=sorted(Path(sys.argv[1]).glob('*.png'))
images=[Image.open(p).convert('RGB') for p in paths]
palette=images[0].quantize(colors=112)
frames=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in images]
frames[0].save(sys.argv[2],save_all=True,append_images=frames[1:],duration=100,loop=0,disposal=2,optimize=True)
images[0].save(sys.argv[3])`,
      dir,
      join(output, id + ".gif"),
      join(output, id + ".png"),
    ]);
    console.log(`${id}: ${count} frames`);
  }
} finally {
  await browser.close();
}
