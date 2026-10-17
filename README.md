# GO — Every move matters

A responsive, light-theme fitness app built with React and Vite. White surfaces, clear data typography, and quiet green accents put your records first. All fonts and snack illustrations are bundled locally.

## What works

- **Overview:** live totals from your own records, weekly completion, step and sleep summaries, and current-day insights.
- **My plan:** real calendar dates, past/future week navigation, a schedule generated from your training goal and frequency, and custom daily plans.
- **Cat coach:** all 22 built-in exercises include a bundled, looping cat demonstration GIF and static poster, pause/play controls, two movement phases, and expandable form cues. Animations only play near the viewport and default to still images with reduced-motion settings. Unknown custom exercises are explicitly marked as lacking a matching demonstration.
- **Training:** day-specific exercises, editable weight/repetition values for every set, completed-set tracking, a pause/resume session timer that survives refresh, saved session history, and editing completed sessions. Future days support planning, not logging a finished workout.
- **Nutrition:** create, edit, and delete meals with calories, protein, carbs, and fats; estimated quick-add servings; automatic daily totals; editable targets; and water tracking.
- **Progress:** recorded-day step/sleep charts, completed sessions, actual consecutive-day streaks, weight logs, directional weight-goal progress, and CSV summaries. Unlogged days remain empty and are excluded from averages.
- **Snack break:** choose a cookie, crisps, chocolate, or a doughnut; unwrap it; take individual bites with visible bite marks and crumbs; optionally enable generated crunch/snap sounds; restart or select another snack. Keyboard activation works, and progress persists. Virtual snacks never create real meal entries. A separate action opens an editable real-serving form.
- **Settings:** name, training goal, weekly frequency, daily nutrition/movement/sleep/water targets, and starting/target weight. Changes update future/unstarted plans while preserving recorded sessions.

## Run

Node.js 22+ is recommended.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
```

For Vercel, import this repository with the **Vite** preset; build command `npm run build`, output directory `dist`. No environment variables are required.

## Verify

```sh
npm test
```

This runs domain tests for calendar boundaries, nutrition totals, goal-dependent schedules, session persistence, timers, streaks, weight goals, and data-based coaching.

With the development server running:

```sh
npx playwright install chromium
npm run test:browser
```

The browser smoke test exercises profile and metrics persistence, nutrition create/edit/delete, hydration, cross-date isolation, custom plans, timer and set completion, history, CSV download, snack interactions, game persistence, virtual/real food separation, and all six views at mobile width. It uses `/usr/bin/chromium` when available; otherwise it uses Playwright's installed Chromium. Optional variables: `BASE_URL`, `CHROMIUM_PATH`, and `SCREENSHOT_DIR`. Screenshots default to `/tmp/go-browser-screenshots`.

## Data and integrations

Records, preferences, and simulation progress persist in **this browser's local storage**, not in a cloud account. Switching devices/browsers does not sync them. Export CSV summaries from Progress; clearing browser storage removes local records. Storage failures are displayed in the app.

Steps, sleep, weight, and meals are manually entered. There is no wearable connection, account backend, or external AI service. The plan coach uses transparent rules based on logged values. Snack nutrition presets are labeled estimates and are editable before real logging. The simulation is a playful experience, not a claim to reduce hunger or replace food.

Legacy Forma profile preferences are migrated automatically; internal legacy storage keys remain compatible.

## Cat demonstration assets

The cat coach is styled after the supplied brown-and-white long-haired tabby reference: a round face, dark forehead stripes, olive eyes, white muzzle, pink nose, and white paws. The original portrait remains at `public/cat-coach/portrait.png` as a design reference. The animation now uses a cohesive furry character rig in `public/cat-coach/character-rig.png`: head, rounded white-chested torso, tabby upper limbs, white lower limbs and paws, and a fluffy striped tail share the same artwork. Dense joint samples keep the textured limbs connected throughout movement, with a gentle tail swish.

The GIFs and posters in `public/exercises` are local assets. They do not require an external image/video host. Their original animated SVG poses live in `src/exerciseDemos.js` and `src/components/ExerciseDemo.jsx`.

To regenerate them with the dev server running (requires Chromium and Python with Pillow):

```sh
npm run generate:demos
# Or regenerate one movement:
npm run generate:demos -- squat
```

The capture helper in `scripts/demoCapture.jsx` is development tooling and is not an application route. Regeneration is not needed for a production build; the generated assets are checked in.

With the development server running, `npm run test:cats` verifies every built-in GIF decodes, frames visibly animate, pause/play and form tips work, session demonstrations appear, mobile layout fits, and reduced-motion users initially get static posters. `npm test` also checks exercise-to-demo mappings and bundled asset coverage.
