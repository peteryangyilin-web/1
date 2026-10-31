# GO — Every move matters

A responsive, black-and-white fitness app built with React and Vite. White surfaces, clear data typography, and monochrome accents put your records first. All fonts and snack illustrations are bundled locally.

## What works

- **Entrance:** the full supplied animation is retimed into `public/branding/go-loading-4s.gif` and plays once in four seconds, including the exit fade. The original `go-loading-smooth-stay.gif` remains available as the source asset. It runs on full page entry, not internal navigation. Skip intro or Escape enters sooner; reduced-motion users enter directly. Image errors and a bounded safety timeout also release the page.

- **Overview:** choose a fitness goal (muscle, fat loss, endurance, or wellbeing), enter personal information and starting/target weight, set training frequency, and edit daily nutrition, movement, hydration, and sleep targets. The profile saves locally and updates the training schedule. Optional age and height are stored as profile information. The logo uses a gray O.
- **Avatar coach:** all 22 built-in exercises select the saved female/male cat or Shiba Inu character. Local looping videos use sixteen painted poses per movement, with static posters, pause/play, movement phases and form cues. Offscreen videos pause; reduced-motion users start with a static poster. Failed media retains the selected character and offers retry. Unknown custom exercises are explicitly marked as lacking a matching demonstration.
- **Training:** real calendar dates, past/future week navigation, goal- and frequency-based schedules, custom daily plans, day-specific exercises, editable weight/repetition values for every set, completed-set tracking, a pause/resume session timer that survives refresh, saved session history, and editing completed sessions. Future days support planning, not logging a finished workout.
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

The browser smoke test exercises profile and metrics persistence, nutrition create/edit/delete, hydration, cross-date isolation, custom plans, timer and set completion, history, CSV download, snack interactions, game persistence, virtual/real food separation, and all five views at mobile width. It uses `/usr/bin/chromium` when available; otherwise it uses Playwright's installed Chromium. Optional variables: `BASE_URL`, `CHROMIUM_PATH`, and `SCREENSHOT_DIR`. Screenshots default to `/tmp/go-browser-screenshots`.

## Data and integrations

Records, preferences, and simulation progress persist in **this browser's local storage**, not in a cloud account. Switching devices/browsers does not sync them. Export CSV summaries from Progress; clearing browser storage removes local records. Storage failures are displayed in the app.

Steps, sleep, weight, and meals are manually entered. There is no wearable connection, account backend, or external AI service. The plan coach uses transparent rules based on logged values. Snack nutrition presets are labeled estimates and are editable before real logging. The simulation is a playful experience, not a claim to reduce hunger or replace food.

Legacy Forma profile preferences are migrated automatically; internal legacy storage keys remain compatible.

## Avatar training animations

Training and the active-session dialog select media from the saved `gender` and `avatarCharacter` fields through `src/trainingAvatars.js`. The library has female cat, male cat, female Shiba Inu and male Shiba Inu variants. Existing profiles without a selection use the same male Shiba default as the profile UI.

All 22 exercise types are covered by 19 movement sequences per character (76 videos). Walking, warm-up, steady cardio and cool-down share a walking sequence with an activity-specific playback rate. Strength variations such as flat/incline presses and cable/dumbbell rows have separate choreography. Exercise names, phases and form cues still come from `src/exerciseDemos.js`.

The PNG sprite sheets in `assets/animation-sources/training` contain sixteen separately painted poses in a 4×4 grid. `scripts/build-training-animations.mjs` slices the sheets, registers stationary feet/supports between poses, centers the character within one shared framing for the entire clip, and plays the poses forward/backward. Registration uses translation only, so the camera never zooms between frames. The Python helper analyzes pixels and writes transform measurements; FFmpeg assembles the original painted poses. It does not use optical flow, blended silhouettes or crossfades. The 3-second MP4 loops and static PNG posters in `public/training` are checked in. The builder also updates `src/trainingMediaVersions.js`; Training requests each video/poster pair with a content version so replacements receive fresh URLs. A normal app build needs no media-generation service or external media host.

To rebuild the media locally (requires FFmpeg, ffprobe, ImageMagick, and Python with Pillow, NumPy and SciPy):

```sh
npm run generate:training
# Rebuild one source sheet:
npm run generate:training -- female-cat-squat.png
# Rebuild all videos after changing the assembler:
npm run generate:training -- --force
```

With a dev or preview server on port 5173, `npm run test:training` checks all 22 mappings for each character, real video playback, pause/resume, form tips, the active-session dialog, mobile layout, reduced-motion defaults, and failure/retry behavior. `npm test` verifies all media paths and distinguishes characters and exercise variations. `npm run test:cats` remains an alias for the current avatar training browser checks. `npm run test:framing` decodes all 76 clips to check centered characters, uncropped artwork, fixed camera scale, and stationary-anchor registration. Training previews share one square size per viewport, with enlarged captions and a compact workout summary card.

Legacy SVG capture tooling (`npm run generate:demos`) and original `public/exercises` assets remain available for reference; Training uses the avatar-specific library.

## Navigation drawer

The navigation stays hidden until the pointer reaches the left edge. Opening it slides the main screen and its GO logo right together. The header menu button provides the same navigation on touch screens and keyboards; Escape or clicking outside closes it. The bottom profile remains in the drawer; the workspace heading and coach promotion have been removed.

The white theme uses botanical green for primary actions and selected goals, with sky blue for the profile summary, hydration, and chart data. The GO logo retains its gray O. Shared color styling lives in `src/colorTheme.css`.

Overview guides users through four screens: goal → gender → desired body type → personal details. Choice cards advance automatically; Back keeps the draft choices and inputs. Saving persists the complete profile on this device and opens Training. Gender and desired body type are profile preferences; the existing goal and weekly frequency determine the training schedule.

On the Gender step, **Select your avatar** offers a full-body, upright Shiba Inu or Selkirk Rex character. Each animal has an integrated fur-covered body, paws and tail, with Lean, Athletic and Strong variants on the following screen. The characters have no clothing or spiral fur motifs. Lean uses a narrow silhouette; Athletic adds abdominal and limb contours; Strong has much broader shoulders and thicker arms and legs. The Select your avatar previews use the fixed supplied cat and dog images. Body-type cards keep Lean unchanged and show pectoral outlines on Athletic and Strong. Selkirk uses a white coat with warm brown patches. The selected gender follows every character preview: Male keeps the original silhouette, while Female uses a narrower waist and wider, rounded hips across all builds. The choice can be changed there and is saved with the profile. Personal profile photos are separate and never appear on the character’s head. With the dev server running, `npm run test:avatar` checks character selection, variants, persistence, mobile layout, and the separate personal-photo editor.

The shared personal settings dialog also offers profile-photo upload above Your name, from both the sidebar profile and header profile button. The saved photo appears in both entry points; photo changes remain a draft until Save preferences.

The Overview entry uses four local SVG movement illustrations, subtle hover feedback, a compact setup estimate, and a navigable step indicator. Users can revisit reached steps without losing their draft; future steps stay disabled until reached. Motion respects reduced-motion preferences. Header and sidebar profile photos use a square, padding-free circular frame on mobile and desktop.

The Male → Shiba Inu → Lean, Athletic and Strong body cards and final profile summary use the supplied original images at `public/avatars/male-dog-lean.png`, `public/avatars/male-dog-athletic.png` and `public/avatars/male-dog-strong.png`. All three images are displayed in full with their original proportions. Other body/species/gender variants keep their corresponding artwork.

Male → Selkirk Rex → Lean, Athletic and Strong also use the supplied originals at `public/avatars/male-cat-lean.png`, `public/avatars/male-cat-athletic.png` and `public/avatars/male-cat-strong.png`, displayed in full in the body cards and final summary. Female variants use their corresponding artwork.

Overview opens on a centered welcome screen with a warm gray-to-sky backdrop and floating product preview cards. **Get started** opens the existing four-step setup. Preview cards move continuously to the left in a seamless loop; a Pause/Play control stops and resumes the motion. Duplicate cards are hidden from assistive technology. Reduced-motion users get a static, horizontally scrollable strip. The GO logo and Overview navigation return to this welcome screen. Uploaded character artwork and profile persistence remain part of the setup flow.

Female → Selkirk Rex → Lean, Athletic and Strong use the supplied originals at `public/avatars/female-cat-lean.png`, `public/avatars/female-cat-athletic.png` and `public/avatars/female-cat-strong.png`, displayed in full in body cards, final summaries and saved-character welcome previews. The selection window uses fixed cat and dog originals.

With a dev or preview server running, `npm run test:entrance` checks supplied-GIF playback, automatic reveal, Skip/Escape, reduced motion, failed-image fallback, and unlocked navigation.

Female → Shiba Inu → Lean, Athletic and Strong use the supplied originals at `public/avatars/female-dog-lean.png`, `public/avatars/female-dog-athletic.png` and `public/avatars/female-dog-strong.png`. The full images appear in body cards, final summaries and saved-character welcome previews.

Select your avatar uses fixed original artwork: the supplied Female Cat Lean photo for Selkirk Rex and Male Dog Lean for Shiba Inu, independent of the gender chosen in setup. Subsequent body-type cards and saved previews continue to follow the selected gender and build.
