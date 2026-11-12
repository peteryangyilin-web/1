# GO weekly training algorithm — implementation notes

## Source and status

The source specification is the user's supplied [健身资源清单与个性化每周训练推荐算法](fitness-weekly-algorithm.cn.md), retained unchanged. Planner version **4**, template version **GO-2026-11-12.1** implements its deterministic product rules. Source IDs S01–S14 refer to that document. Links and publication claims (including the supplied ACSM 2026 reference) have not been independently verified in this implementation. No content, images or videos were copied from those external resources.

GO templates and substitutions are product implementations **pending professional review**, not clinically validated prescriptions or medical clearance. The interface and catalog preserve this distinction. The system is rules based; it does not call an LLM or claim to provide an AI medical assessment.

## Inputs and scope

Overview keeps the four basic inputs. Training has a separate three-step setup: recent resistance history and technique familiarity, recent aerobic activity or an explicit unknown response, comfortable continuous movement, actual weekday/minute windows, available equipment, preferences, and health questions. Old profile defaults, a number of available days, BMI or an `eligible_general_plan` flag cannot substitute for missing answers. Answers and feedback sync in the user's existing workspace; privacy information includes this data.

Current chest pain, fainting or unusual breathlessness takes priority even when other answers are incomplete. New pain, known conditions, uncertain answers or pregnancy/postpartum/post-surgery/rehabilitation needs route to individual assessment. This is conservative routing in a prototype, not a declaration that a person cannot exercise. Under-18, 65+ and HYROX users receive specialist-path resources because independently reviewed dedicated templates are not implemented. In particular, older users are not automatically classified as beginners or given weaker loads merely because of age.

General adult templates cover the four existing GO goals plus a strength focus in Training Setup. The engine also accepts the supplied canonical goal aliases (`hypertrophy`, `fat_loss`, `general_health`). Body weight, BMI, sex, height and the cosmetic character do not determine strength, impact restrictions or running eligibility. The selected male/female cat/dog continues to resolve through the existing animation library.

## Planning and audits

- Enumerate the user's actual windows. Prefer separation between resistance sessions, including across week boundaries; beginners' adjacent lifting slots become non-lifting slots instead. Do not add sessions to unapproved days. Available windows are a ceiling, not a requirement to fill every day; introductory schedules use at most three dedicated cardio/movement modules and leave unused windows free.
- Use whole-body A/B for introductory plans; experienced hypertrophy users with four available lifting slots get upper/lower splits. Experience requires both recent consistent training and movement familiarity. Returning or unfamiliar users use an introductory dose. A user who needs hinge instruction is given an explicit coverage gap, rather than a made-up safe replacement.
- Hard-filter supported equipment, movement familiarity and explicit lower-impact preferences. The current filmed catalog supports gym access and dumbbells with a stable seat. A no-equipment/bands setup cannot supply the implemented pulling task: request an equipment alternative or coached template instead of fabricating one.
- Start with 1–2 working sets when budgets require, generally 2 for novices; other adult goals use 3, with up to 4 for experienced hypertrophy when feasible. Default effort is RIR 3. Rest is 120 seconds, or 180 for experienced strength-focus work. No initial kilogram load or 1RM is inferred. The log starts uncalibrated loads blank.
- Count warm-up, practice, work time (including both sides), between-set rest, transitions and cool-down. Remove accessories and reduce sets before shortening necessary rests. If important patterns cannot fit, show the coverage/constraint gap and offer a lower dose, without claiming a complete template. Budget estimates still need real-session validation.
- Count only explicitly prescribed moderate aerobic work toward weekly aerobic totals. Easy movement, rest, strength and warm-up/cool-down are excluded. No vigorous blocks are currently prescribed; the output schema includes vigorous minutes and moderate-equivalent totals for extension. Direct primary-muscle sets are audited separately from secondary stimulus; secondary stimulus is not inflated into full direct sets.
- Display this week's actual dose and its gap to the long-term adult reference, alongside template/source versions. Do not silently add walking outside the agreed windows to claim the target was met.

The supplied 25-year-old beginner fat-loss example (Mon/Tue/Thu/Sat, 60-minute windows, familiar with light movements, gym, 20-minute cardio tolerance and no recent aerobic activity) produces **2 strength days, 60 moderate aerobic minutes, 150 total calendar minutes**. Wed/Fri/Sun are genuine zero-session rest days. Exercise choices are constrained to GO's own existing demonstrations rather than reproducing every example movement that lacks a matching film.

## Feedback and progression

Session logs retain actual completed sets, reps and optional weights. Finish can collect warning symptoms, new pain, recovery, fatigue, stable technique across all working sets, the lowest reported RIR, cardio tolerance and completion barriers. The user can save without feedback; that is treated as missing, never as success.

The next week's exercise-specific load advice requires two completed qualifying exposures to the same stable exercise ID: all old working sets done at the upper rep limit with consistent load, stable technique, RIR ≥2, no pain/warnings and normal recovery/fatigue. GO suggests considering the smallest available 2–5% increase; the entered load is not automatically changed. Large equipment jumps can be declined. A single bad session does not trigger regression. Two successive poor recoveries/high-fatigue reports temporarily reduce total working sets by roughly 25–40%, with reassessment after a week; it does not use the freed time to add more cardio.

A recorded completion rate below 70% prompts checking barriers. A reported time barrier shortens next-week sessions to at most 30 minutes; it does not automatically lower every exercise's weight. Equipment/interest/fatigue barriers are surfaced for setup review. Comfortable cardio with suitable feedback may add up to 5 minutes to only one eligible session, within its window, without changing intensity or frequency. Compatible prior doses are maintained if new feedback is missing. New pain or warning symptoms pause general training pending assessment/current screening review.

Started/completed session plans are immutable snapshots. Their history remains viewable after preferences or safety answers change; safety routing still prevents a restricted incomplete session being resumed. Old/custom plans do not acquire fabricated new audit totals. New unstarted recommendations use the current version and answers.

## Validation

`npm test` covers the exact uploaded example; missing/invalid answers; symptom precedence and unsupported population routing; equipment filtering; goals and experience; no BMI/sex load assumptions; time and rest-day constraints; muscle/aerobic accounting; feedback progression, regression, adherence and missing-data behavior; and historical snapshots. The planner matrix includes **1,680** combinations of goals, history, minutes, equipment and actual day windows. The existing 76 animation files retain media/character checks.

`npm run test:personalization` builds on the controlled account transport browser suite to cover setup, cloud save/reload, exact totals, blank load calibration, session feedback, safety routing, stable saved history and mobile layout. Build a preview with the test-only public Supabase URL/key described in README first. These tests do not validate live delivery, clinical outcomes or actual training duration.
