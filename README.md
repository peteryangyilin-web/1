# GO — Every move matters

A responsive fitness app built with React and Vite. White surfaces, clear data typography, a unified lemon-green palette and small sky-blue accents put your records first. All fonts and snack illustrations are bundled locally. Brand colors and their hover, surface, border and readable text shades are centralized in `src/colorTheme.css`.

## What works

- **Entrance:** the full supplied animation is retimed into `public/branding/go-loading-4s.gif` and plays once in four seconds, including the exit fade. The original `go-loading-smooth-stay.gif` remains available as the source asset. It runs on full page entry, not internal navigation. Skip intro or Escape enters sooner; reduced-motion users enter directly. Image errors and a bounded safety timeout also release the page.

- **Overview:** choose a goal and avatar, then enter just four details: age, height, weight and available days per week (1–7). Saving opens Training and uses the local goal guide to calculate suitable starting targets. No target guide, nutrition form, name field or advanced training questionnaire appears in this final setup step. Account names are entered at registration or in the compact profile dialog. Targets start from Overview guidance; the separate Training Setup collects actual availability and training context. Existing manual targets are preserved.
- **Avatar coach:** all 22 built-in exercises select the saved female/male cat or Shiba Inu character. Local looping videos use sixteen painted poses per movement, with static posters, pause/play, movement phases and form cues. Offscreen videos pause; reduced-motion users start with a static poster. Failed media retains the selected character and offers retry. Unknown custom exercises are explicitly marked as lacking a matching demonstration.
- **Training:** real calendar dates, past/future week navigation, goal-, capacity- and time-window-based schedules, custom daily plans, day-specific exercises, editable weight/repetition values for every set, completed-set tracking, a pause/resume session timer that survives refresh, saved session history, and editing completed sessions when no safety restriction is active. Future days support planning, not logging a finished workout.
- **Nutrition:** search common foods in English or Chinese, add gram portions, and calculate multi-food meal calories/macros. Generic food values are explicitly estimates. Meals can be edited, deleted and reloaded, with daily totals recalculated. Manual entry requires only a name and calories; unknown macros stay missing and partial totals are flagged. Future-date screens explain why logging is disabled and offer a return-to-today action. Water uses a consistent 250 mL glass.
- **Progress:** recorded-day step/sleep charts, completed sessions, actual consecutive-day streaks, weight logs, directional weight-goal progress, and CSV summaries. Unlogged days remain empty and are excluded from averages.
- **Snack break:** choose a cookie, crisps, chocolate, or a doughnut; unwrap it; take individual bites with visible bite marks and crumbs; optionally enable generated crunch/snap sounds; restart or select another snack. Keyboard activation works, and progress persists. Virtual snacks never create real meal entries. A separate action opens an editable real-serving form.
- **Profile:** photo and name, with Account inside for contact/password management. Training Setup is separate and updates only unstarted recommendations; recorded sessions stay unchanged.

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

For Vercel, import this repository with the **Vite** preset; build command `npm run build`, output directory `dist`. Browser-only preview needs no environment variables. Real accounts require the public Supabase URL/key, the database migration, and configured email/SMS delivery; see the account setup guide below.

## Verify

```sh
npm test
```

This runs domain tests for calendar boundaries, nutrition totals, goal-dependent schedules, session persistence, timers, streaks, weight goals, and data-based coaching.

With the development server running:

```sh
npx playwright install chromium
npm run test:browser
npm run test:guidance
```

The browser smoke test exercises profile and metrics persistence, nutrition create/edit/delete, hydration, cross-date isolation, custom plans, timer and set completion, history, CSV download, snack interactions, game persistence, virtual/real food separation, and all five views at mobile width. It uses `/usr/bin/chromium` when available; otherwise it uses Playwright's installed Chromium. Optional variables: `BASE_URL`, `CHROMIUM_PATH`, and `SCREENSHOT_DIR`. Screenshots default to `/tmp/go-browser-screenshots`.

## Data and integrations

Without account-service configuration, GO explicitly runs as a browser-only preview and stores records locally. With Supabase configured, verified accounts save their own workspace to the database and can load it on another device. Account data is not copied into shared guest storage. Old local progress requires an explicit import choice. Export CSV summaries from Progress; sync errors and concurrent-device conflicts are displayed.

Steps, sleep, weight, and meal portions are manually entered. Food estimates use a small bundled generic catalog, not a brand-specific food database. The goal guide is a transparent on-device calculation, not an external AI service. Its Mifflin–St Jeor energy range spans both formula variants rather than inferring physiology from the selected avatar, includes modest goal adjustments, and avoids calorie/weight-change suggestions for minors, missing inputs or measurements outside the estimator’s supported range. There is no wearable connection or external AI service. The optional account backend is Supabase. The plan coach uses transparent rules based on logged values. Snack nutrition presets are labeled estimates and are editable before real logging. The simulation is a playful experience, not a claim to reduce hunger or replace food.

Legacy Forma profile preferences are migrated automatically; internal legacy storage keys remain compatible.

## Goal-specific training and target guidance

All four goals have separate unstarted weekly sequences, session emphasis, durations and set/repetition patterns. Beginner volume is lower and barbell bench press is replaced with a push-up starting variation; experienced muscle-building plans can add a set. A goal-labelled week preview makes the differences visible even on recovery days. Existing saved sessions and custom plans retain their authored plan and are labelled accordingly.

`src/profileGuidance.js` contains documented activity definitions and target logic shared by Overview and Settings. Suggested nutrition numbers are estimates to review with appetite, energy and trends after 2–4 weeks, not a clinical prescription or a guaranteed result. Protein/carbs/fats are energy-consistent rounded values. `src/foodCatalog.js` contains the serving data and portion calculator. `npm run test:guidance` checks the actual guided questionnaire, optional calorie targets, goal changes, multi-food portions, edit/delete/reload, unknown macros, future dates and mobile layout.

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

The white theme uses lemon green for primary actions and selected goals, with sky blue for the profile summary, hydration, and chart data. The GO logo retains its gray O. Shared color styling lives in `src/colorTheme.css`.

Overview guides users through four screens: goal → gender → desired body type → personal details. Choice cards advance automatically; Back keeps the draft choices and inputs. Saving persists the complete profile to the account (or this browser in preview mode) and opens Training. Gender and desired body type are profile preferences; the existing goal and weekly frequency determine the training schedule.

On the Gender step, **Select your avatar** offers a full-body, upright Shiba Inu or Selkirk Rex character. Each animal has an integrated fur-covered body, paws and tail, with Lean, Athletic and Strong variants on the following screen. The characters have no clothing or spiral fur motifs. Lean uses a narrow silhouette; Athletic adds abdominal and limb contours; Strong has much broader shoulders and thicker arms and legs. The Select your avatar previews use the fixed supplied cat and dog images. Body-type cards keep Lean unchanged and show pectoral outlines on Athletic and Strong. Selkirk uses a white coat with warm brown patches. The selected gender follows every character preview: Male keeps the original silhouette, while Female uses a narrower waist and wider, rounded hips across all builds. The choice can be changed there and is saved with the profile. Personal profile photos are separate and never appear on the character’s head. With the dev server running, `npm run test:avatar` checks character selection, variants, persistence, mobile layout, and the separate personal-photo editor.

The shared personal settings dialog also offers profile-photo upload above Your name, from both the sidebar profile and header profile button. The saved photo appears in both entry points; photo changes remain a draft until Save profile. The compact dialog contains only photo upload, name and saving; signed-in users open Account from here to manage verified contacts, their password and sign-out. Account is no longer a separate header button.

The Overview entry uses four local SVG movement illustrations, subtle hover feedback, a compact setup estimate, and a navigable step indicator. Users can revisit reached steps without losing their draft; future steps stay disabled until reached. Motion respects reduced-motion preferences. Header and sidebar profile photos use a square, padding-free circular frame on mobile and desktop.

The Male → Shiba Inu → Lean, Athletic and Strong body cards and final profile summary use the supplied original images at `public/avatars/male-dog-lean.png`, `public/avatars/male-dog-athletic.png` and `public/avatars/male-dog-strong.png`. All three images are displayed in full with their original proportions. Other body/species/gender variants keep their corresponding artwork.

Male → Selkirk Rex → Lean, Athletic and Strong also use the supplied originals at `public/avatars/male-cat-lean.png`, `public/avatars/male-cat-athletic.png` and `public/avatars/male-cat-strong.png`, displayed in full in the body cards and final summary. Female variants use their corresponding artwork.

Overview opens on a centered welcome screen with a warm gray-to-sky backdrop and floating product preview cards. **Get started** opens the existing four-step setup. Preview cards move continuously to the left in a seamless loop; a Pause/Play control stops and resumes the motion. Duplicate cards are hidden from assistive technology. Reduced-motion users get a static, horizontally scrollable strip. The GO logo and Overview navigation return to this welcome screen. Uploaded character artwork and profile persistence remain part of the setup flow.

Female → Selkirk Rex → Lean, Athletic and Strong use the supplied originals at `public/avatars/female-cat-lean.png`, `public/avatars/female-cat-athletic.png` and `public/avatars/female-cat-strong.png`, displayed in full in body cards, final summaries and saved-character welcome previews. The selection window uses fixed cat and dog originals.

With a dev or preview server running, `npm run test:entrance` checks supplied-GIF playback, automatic reveal, Skip/Escape, reduced motion, failed-image fallback, and unlocked navigation.

Female → Shiba Inu → Lean, Athletic and Strong use the supplied originals at `public/avatars/female-dog-lean.png`, `public/avatars/female-dog-athletic.png` and `public/avatars/female-dog-strong.png`. The full images appear in body cards, final summaries and saved-character welcome previews.

Select your avatar uses fixed original artwork: the supplied Female Cat Lean photo for Selkirk Rex and Male Dog Lean for Shiba Inu, independent of the gender chosen in setup. Subsequent body-type cards and saved previews continue to follow the selected gender and build.

### Personalized training methodology

Training uses version 4 of the user's supplied [weekly-plan algorithm](docs/fitness-weekly-algorithm.cn.md). Overview remains compact; **Training → Complete/Edit training setup** collects experience, technique, actual weekday/minute windows, equipment, recent activity and health-routing answers. Missing information never becomes guessed medical clearance. Unsupported specialist populations receive a separate resource path; ordinary adult templates are product rules pending professional review.

Plans honor real time windows including warm-up, working sets, rest, transitions and cool-down. Rest days stay empty. BMI, body size and sex do not determine lifting ability or running eligibility. Weekly strength days, direct muscle sets, moderate aerobic minutes and calendar time are audited separately, with visible gaps to long-term reference targets. Avatar-specific animations remain unchanged.

After training, optional feedback plus actual set logs inform the next week. Two qualifying exposures allow a small load-increase suggestion; two poor recoveries reduce working-set volume; time barriers shorten the schedule; missing feedback never creates automatic progression. New pain/warnings pause general training. Started/completed history remains unchanged.

Read [the implementation, source-access limits and unimplemented specialist paths](docs/training-evidence.md). This is general fitness guidance, not medical clearance or a clinically validated prescription.

`npm test` includes the uploaded example and a 1,680-profile constraint matrix. `npm run test:personalization` uses the controlled account transport preview on port 5176 and covers setup, exact totals, session feedback, safety routing, persistence and mobile layout. Build that preview using the test configuration in the account section below; it never sends real emails/SMS.

## Verified accounts and owner administration

See [the step-by-step Chinese setup guide](docs/accounts-setup.zh-CN.md). New users no longer inherit a sample person’s name. Email/phone password signup and sign-in use Supabase Auth, with link/code verification as an alternative; contacts are verified by the service, not a browser flag. Existing link-only accounts can set a password in Account. Email password recovery returns to `/auth/reset-password`; allow this exact URL in Supabase redirect configuration. Passwords are sent only to Auth and are never written into fitness records or the administrator directory. Existing accounts can verify and link a second contact in Account. SMS requires an SMS provider; public email delivery requires an appropriate SMTP setup.

Apply `supabase/migrations/202611040001_go_accounts.sql` to a dedicated Supabase project, set the public variables from `.env.example` in Vercel, and redeploy. A developer-assisted alternative is to put only the public project URL/publishable key in `src/accounts/project.public.json` and redeploy. A complete environment-variable pair overrides this file; incomplete pairs never mix sources. The build rejects private keys in either source. No private/admin keys are used in the browser. Create and verify the owner’s email account, then run the separately controlled `supabase/assign-admin.sql` in the SQL Editor. The owner’s actual email is intentionally not embedded in the public repository.

`/admin` shows registered-account contacts, verification status, profile details and saved-activity summaries with search/pagination. Anonymous visitors are not identified. Database functions enforce membership in a private administrator table and log directory/profile views. Ordinary accounts cannot read another workspace or promote themselves. Workspace writes check both account identity and the expected revision to prevent cross-account queue writes and stale-device overwrites. This is read-only administration; it does not add account deletion, role editing or password access to the UI.

`npm test` includes a PostgreSQL/PGlite migration/RLS/privilege test and cloud-save queue tests. `npm run test:accounts` exercises auth/cloud/admin browser flows through a controlled HTTP transport, **not live email/SMS delivery**. For this suite build a separate preview with `VITE_SUPABASE_URL=http://127.0.0.1:54321` and `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_go_browser_test`, serving it on port 5176; use `ACCOUNTS_BASE_URL` to override. Never deploy these test settings.

When the service is not configured, sign-up is unavailable and the admin route shows a setup state. A code-only deployment does not create real accounts or deliver verification messages. Before public registrations, validate delivery and two-account isolation against the actual configured project and review the data notice at `/privacy.html`.

The operator helper at `/setup.html` offers one-click copying of the initialization SQL and a direct link to the configured project's SQL Editor. Vite emits `/setup/go-accounts.sql` from the tested migration at build time, plus URL-only project metadata. The helper does not execute SQL, collect credentials or grant administrator access.
