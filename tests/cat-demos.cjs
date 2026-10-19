const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
let browser;
(async () => {
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.BASE_URL || "http://localhost:5173");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page
    .getByRole("button", { name: "Profile settings", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Sessions per week")
    .selectOption("6");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Training", exact: true }).click();
  const chooseDate = async (date) => {
    await page.locator(".date-button").click();
    await page.getByLabel("Date", { exact: true }).fill(date);
    await page.getByRole("button", { name: "View day", exact: true }).click();
  };
  await chooseDate("2026-10-12");
  await page.locator('[data-exercise-demo="bench"] img').waitFor();
  const first = page.locator('[data-exercise-demo="bench"]');
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.match(await first.locator("img").getAttribute("src"), /\.gif$/);
  const a = await first.locator("img").screenshot();
  await page.waitForTimeout(850);
  const b = await first.locator("img").screenshot();
  assert.equal(a.equals(b), false, "GIF frames must visually change");
  await first
    .getByRole("button", { name: "Pause Barbell bench press demo" })
    .click();
  assert.match(await first.locator("img").getAttribute("src"), /\.png$/);
  await first
    .getByRole("button", { name: "Play Barbell bench press demo" })
    .click();
  await first.getByRole("button", { name: "How to do it" }).click();
  assert.equal(await first.locator(".demo-instructions li").count(), 3);
  assert.equal(
    await first
      .getByRole("button", { name: "Hide form tips" })
      .getAttribute("aria-expanded"),
    "true",
  );
  const seen = new Set();
  for (const date of [
    "2026-10-12",
    "2026-10-13",
    "2026-10-14",
    "2026-10-15",
    "2026-10-16",
    "2026-10-11",
  ]) {
    await chooseDate(date);
    for (const demo of await page
      .locator(".session-outline [data-exercise-demo]")
      .all()) {
      await demo.scrollIntoViewIfNeeded();
      await demo.locator("img").evaluate((img) => img.decode());
      seen.add(await demo.getAttribute("data-exercise-demo"));
    }
  }
  assert.equal(seen.size, 22);
  await chooseDate("2026-10-12");
  await page
    .getByRole("button", { name: "Start session", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  assert.equal(await dialog.locator("[data-exercise-demo]").count(), 5);
  await dialog.getByRole("button", { name: "How to do it" }).first().click();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "/tmp/go-cat-training-mobile.png",
    fullPage: true,
  });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const reduced = await context.newPage();
  await reduced.goto(process.env.BASE_URL || "http://localhost:5173");
  await reduced.getByRole("button", { name: "Open navigation", exact: true }).click();
  await reduced.getByRole("button", { name: "Training", exact: true }).click();
  const d = reduced.locator("[data-exercise-demo]").first();
  await d.scrollIntoViewIfNeeded();
  assert.match(await d.locator("img").getAttribute("src"), /\.png$/);
  await d.getByRole("button", { name: /^Play .* demo$/ }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: all 22 cat GIFs decode; frames visibly animate; pause/play, form tips, in-session demos, mobile layout, and reduced-motion defaults work.",
  );
  await browser.close();
})().catch(async (e) => {
  await browser?.close();
  console.error(e);
  process.exit(1);
});
