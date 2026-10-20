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
  const navTo = async (label) => {
    if (await p.locator('#go-navigation').getAttribute('aria-hidden') === 'true')
      await p.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await p.locator('#go-navigation').getByRole('button', { name: label, exact: true }).click();
  };
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(process.env.BASE_URL || "http://localhost:5173");
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.getByRole("heading", { name: "Let’s make it yours." }).waitFor();
  assert.equal(await p.locator(".hero").count(), 0);
  assert.equal(
    await p.getByRole("button", { name: "My plan", exact: true }).count(),
    0,
  );
  assert.equal(
    await p
      .locator(".go-symbol > span")
      .evaluate((e) => getComputedStyle(e).color),
    "rgb(133, 133, 133)",
  );
  assert.equal(await p.getByLabel("Your name", {exact:true}).count(), 0);
  assert.equal(await p.locator('.goal-artwork').count(), 4);
  assert.equal(await p.getByRole('button', {name:'Step 2: About you',exact:true}).isDisabled(), true);
  await p.getByText("Lose fat", {exact:true}).click();
  assert.equal(await p.getByRole("heading", {name:"Tell us about you",exact:true}).isVisible(), true);
  await p.getByRole("button", {name:/^Female/}).click();
  await p.getByRole("button", {name:/^Athletic/}).click();
  await p.getByLabel("Your name", { exact: true }).fill("Jordan Lee");
  await p.getByLabel("Age · years").fill("28");
  await p.getByLabel("Height · cm").fill("175");
  await p.getByLabel("Sessions per week").selectOption("3");
  await p.getByRole('button', {name:'Step 1: Your goal',exact:true}).click();
  assert.equal(await p.getByRole('heading', {name:'Choose your goal',exact:true}).isVisible(), true);
  await p.getByRole('button', {name:'Step 4: Your details',exact:true}).click();
  assert.equal(await p.getByLabel('Your name', {exact:true}).inputValue(), 'Jordan Lee');
  await p
    .getByRole("button", { name: "Save your profile and go to training", exact: true })
    .click();
  assert.equal(await p.locator('nav [aria-current="page"]').textContent(), "Training");
  await p.reload();
  assert.equal(await p.getByRole("radio", {name:/Lose fat/}).isChecked(), true);
  await p.getByText("Lose fat", {exact:true}).click();
  assert.equal(await p.getByRole("button", {name:/^Female/}).getAttribute("aria-pressed"), "true");
  await p.getByRole("button", {name:/^Female/}).click();
  assert.equal(await p.getByRole("button", {name:/^Athletic/}).getAttribute("aria-pressed"), "true");
  await p.getByRole("button", {name:/^Athletic/}).click();
  assert.equal(
    await p.getByLabel("Your name", { exact: true }).inputValue(),
    "Jordan Lee",
  );
  assert.equal(await p.getByLabel("Age · years").inputValue(), "28");
  assert.equal(await p.getByLabel("Height · cm").inputValue(), "175");
  await p.getByRole("button", { name: "Save your profile and go to training", exact: true }).click();
  assert.equal(
    await p.locator('nav [aria-current="page"]').textContent(),
    "Training",
  );
  await navTo("Progress");
  console.log("metrics");
  await p.getByRole("button", { name: "Log metrics", exact: true }).click();
  await p.getByLabel("Steps", { exact: true }).fill("8432");
  await p.getByLabel("Sleep · hours").fill("7.5");
  await p.getByLabel("Weight · kg").fill("73.5");
  await p.getByRole("button", { name: "Save daily metrics" }).click();
  assert.equal(
    await p.locator('.chart-bar[aria-label$="8432 steps"]').count(),
    1,
  );
  console.log("food");
  await navTo("Nutrition");
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
  await navTo("Nutrition");
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
  await navTo("Training");
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
  await navTo("Training");
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
  await navTo("Progress");
  assert.match(await p.locator(".weight-progress").textContent(), /50%/);
  assert.equal(await p.locator(".session-history button").count(), 1);
  const [download] = await Promise.all([
    p.waitForEvent("download"),
    p.getByRole("button", { name: "Export data", exact: true }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "go-progress.csv");
  await navTo("Snack break");
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
  await navTo("Snack break");
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
  await navTo("Nutrition");
  assert.match(await p.locator(".calorie-ring").textContent(), /520/);
  await navTo("Overview");
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
    await navTo(tab);
    await p.waitForTimeout(150);
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
      `${tab} overflows mobile`,
    );
  }
  await navTo("Overview");
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
