const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const screenshots = process.env.SCREENSHOT_DIR || "/tmp/go-browser-screenshots";
fs.mkdirSync(screenshots, { recursive: true });
let activeBrowser;
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
  activeBrowser = b;
  const p = await b.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  p.setDefaultTimeout(7000);
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(process.env.BASE_URL || "http://localhost:5173");
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.getByRole("heading", { name: /Good/ }).waitFor();
  assert.equal(
    await p.getByRole("button", { name: "My plan", exact: true }).count(),
    0,
  );
  await p
    .getByRole("button", { name: "Explore training", exact: true })
    .click();
  assert.equal(
    await p.locator('nav button[aria-current="page"]').textContent(),
    "Training",
  );
  await p.getByRole("button", { name: "Overview", exact: true }).click();
  await p.locator(".preview-week button").first().click();
  assert.equal(
    await p.locator('nav button[aria-current="page"]').textContent(),
    "Training",
  );
  await p.getByRole("button", { name: "Today", exact: true }).click();
  await p.getByRole("button", { name: "Overview", exact: true }).click();

  assert.equal(
    await p
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  console.log("profile");
  await p
    .getByRole("button", { name: "Profile settings", exact: true })
    .click();
  await p.getByLabel("Your name", { exact: true }).fill("Jordan Lee");
  await p.getByLabel("Sessions per week").selectOption("3");
  await p.getByRole("button", { name: "Save preferences" }).click();
  await p.reload();
  await p.getByRole("heading", { name: /Jordan/ }).waitFor();
  console.log("metrics");
  await p.getByRole("button", { name: "Edit or view Daily movement" }).click();
  await p.getByLabel("Steps", { exact: true }).fill("8432");
  await p.getByLabel("Sleep · hours").fill("7.5");
  await p.getByLabel("Weight · kg").fill("73.5");
  await p.getByRole("button", { name: "Save daily metrics" }).click();
  assert.match(await p.locator(".metrics-grid").textContent(), /8,432/);
  console.log("food");
  await p.getByRole("button", { name: "Nutrition", exact: true }).click();
  await p.getByRole("button", { name: "Add meal", exact: true }).click();
  await p.getByLabel("Meal name").fill("Salmon lunch");
  await p.getByLabel("Calories · kcal", { exact: true }).fill("500");
  await p.getByLabel("Protein · g", { exact: true }).fill("40");
  await p.getByLabel("Carbs · g", { exact: true }).fill("45");
  await p.getByLabel("Fats · g", { exact: true }).fill("15");
  await p.getByRole("button", { name: "Log meal", exact: true }).click();
  assert.match(await p.locator(".calorie-ring").textContent(), /500/);
  await p.getByRole("button", { name: "Edit Salmon lunch" }).click();
  await p.getByLabel("Calories · kcal", { exact: true }).fill("520");
  await p.getByRole("button", { name: "Save meal", exact: true }).click();
  assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  await p.getByRole("button", { name: "Add meal", exact: true }).click();
  await p.getByRole("button", { name: /Greek yogurt/ }).click();
  assert.match(await p.locator(".calorie-ring").textContent(), /730/);
  await p
    .getByRole("button", { name: "Delete Greek yogurt & berries" })
    .click();
  assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  await p.getByRole("button", { name: "Add glass of water" }).click();
  await p.reload();
  await p.getByRole("button", { name: "Nutrition", exact: true }).click();
  assert.match(await p.locator(".water-value").textContent(), /1/);
  assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  const today = await p
    .locator(".week-day.selected")
    .getAttribute("aria-label");
  const other = p.locator(".week-day").first();
  if ((await other.getAttribute("aria-label")) !== today) {
    await other.click();
    assert.match(await p.locator(".calorie-ring").textContent(), /^0/);
    await p.getByRole("button", { name: "Today", exact: true }).click();
    assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  }
  await p.getByRole("button", { name: "Training", exact: true }).click();
  await p.locator(".workout-card .tag").click();
  await p.getByLabel("Session name").fill("Test strength");
  await p.getByLabel("Exercises · one per line").fill("Squat\nRow");
  await p.getByRole("button", { name: "Save day’s plan" }).click();
  await p.getByRole("button", { name: "Start session", exact: true }).click();
  await p.getByRole("button", { name: "Start timer", exact: true }).click();
  await p.waitForTimeout(1200);
  await p.getByRole("button", { name: "Pause", exact: true }).click();
  assert.notEqual(
    await p.locator(".session-timer strong").textContent(),
    "00:00",
  );
  await p.getByRole("button", { name: "Finish session", exact: true }).click();
  await p
    .getByText("Check off at least one completed set to save this session.", {
      exact: true,
    })
    .waitFor();
  await p.getByLabel("Squat set 1 weight").fill("40");
  await p
    .getByRole("button", { name: "Squat set 1 complete", exact: true })
    .click();
  await p.getByRole("button", { name: "Finish session", exact: true }).click();
  await p.reload();
  await p.getByRole("button", { name: "View session", exact: true }).waitFor();
  await p.getByRole("button", { name: "View session", exact: true }).click();
  assert.equal(await p.getByLabel("Squat set 1 weight").inputValue(), "40");
  assert.equal(
    await p
      .getByRole("button", { name: "Squat set 1 complete", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await p.keyboard.press("Escape");
  await p.getByRole("button", { name: "Progress", exact: true }).click();
  assert.match(await p.locator(".weight-progress").textContent(), /50%/);
  assert.equal(await p.locator(".session-history button").count(), 1);
  const [download] = await Promise.all([
    p.waitForEvent("download"),
    p.getByRole("button", { name: "Export data", exact: true }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "go-progress.csv");
  await p.getByRole("button", { name: "Snack break", exact: true }).click();
  await p.getByRole("button", { name: /A satisfying crunch/ }).click();
  await p.getByRole("button", { name: "Enable snack sounds" }).click();
  assert.equal(
    await p
      .getByRole("button", { name: "Mute snack sounds" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await p.getByRole("button", { name: "Mute snack sounds" }).click();
  await p
    .getByRole("button", { name: "Unwrap your snack", exact: true })
    .click();
  for (let i = 0; i < 6; i++) {
    await p.getByRole("button", { name: "Take a bite", exact: true }).click();
    await p.waitForTimeout(400);
  }
  await p
    .getByRole("heading", { name: "A little moment, well spent." })
    .waitFor();
  await p.reload();
  await p.getByRole("button", { name: "Snack break", exact: true }).click();
  assert.match(await p.locator(".break-summary strong").textContent(), /1/);
  await p.getByRole("button", { name: /A little dark chocolate/ }).click();
  await p
    .getByRole("button", { name: "Unwrap your snack", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Take a bite of Dark chocolate", exact: true })
    .focus();
  await p.keyboard.press("Space");
  await p.waitForTimeout(400);
  assert.match(await p.locator(".bite-progress").textContent(), /1 \/ 6/);
  await p
    .getByRole("button", { name: "Log a real serving", exact: true })
    .click();
  assert.equal(await p.getByLabel("Meal name").inputValue(), "Dark chocolate");
  await p.keyboard.press("Escape");
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(180);
  await p.screenshot({
    path: path.join(screenshots, "go-snack-break.png"),
    fullPage: true,
  });
  await p.getByRole("button", { name: "Nutrition", exact: true }).click();
  assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  await p.getByRole("button", { name: "Overview", exact: true }).click();
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(180);
  await p.screenshot({
    path: path.join(screenshots, "go-desktop.png"),
    fullPage: true,
  });
  await p.setViewportSize({ width: 390, height: 844 });
  for (const tab of [
    "Overview",
    "Training",
    "Nutrition",
    "Progress",
    "Snack break",
  ]) {
    await p.getByRole("button", { name: tab, exact: true }).click();
    await p.waitForTimeout(150);
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
      `${tab} overflows mobile`,
    );
  }
  await p.getByRole("button", { name: "Overview", exact: true }).click();
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(180);
  await p.screenshot({
    path: path.join(screenshots, "go-mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: profile persistence, metrics, meal add/edit/delete, water persistence, date isolation, plan editing, timer, completion validation, set recovery, history, goal calculation, CSV export, all 5 mobile views; snack selection, sound toggle, unwrap, bite completion, game persistence, keyboard control, and no virtual calorie logging; no browser errors.",
  );
  await b.close();
})().catch(async (e) => {
  await activeBrowser?.close();
  console.error(e);
  process.exit(1);
});
