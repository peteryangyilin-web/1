import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PROFILE,
  weekDates,
  emptyDay,
  totalNutrition,
  getPlan,
  createSession,
  elapsedSeconds,
  completedSets,
  streak,
  weightProgress,
  coachInsights,
} from "../src/model.js";

test("week navigation handles year and leap-day boundaries", () => {
  assert.deepEqual(weekDates("2026-01-01"), [
    "2025-12-29",
    "2025-12-30",
    "2025-12-31",
    "2026-01-01",
    "2026-01-02",
    "2026-01-03",
    "2026-01-04",
  ]);
  assert.equal(weekDates("2024-02-29")[3], "2024-02-29");
  assert.equal(weekDates("2026-01-01", -1)[0], "2025-12-22");
});
test("nutrition totals account for individual entries and removal", () => {
  const a = { calories: 320, protein: 20, carbs: 40, fats: 9 },
    b = { calories: 210, protein: 10, carbs: 25, fats: 4 };
  assert.deepEqual(totalNutrition([a, b]), {
    calories: 530,
    protein: 30,
    carbs: 65,
    fats: 13,
  });
  assert.equal(totalNutrition([b]).calories, 210);
  assert.equal(totalNutrition([]).protein, 0);
});
test("weekly schedule follows frequency and goal while preserving logged sessions", () => {
  for (const days of [3, 4, 5, 6]) {
    const p = { ...DEFAULT_PROFILE, days };
    assert.equal(
      weekDates("2026-10-16").filter((d) => getPlan(d, p).type !== "Recovery")
        .length,
      days,
    );
  }
  const d = "2026-10-12";
  const strength = getPlan(d, DEFAULT_PROFILE),
    endurance = getPlan(d, { ...DEFAULT_PROFILE, goal: "endurance" });
  assert.notEqual(strength.type, endurance.type);
  assert.deepEqual(
    getPlan(
      d,
      { ...DEFAULT_PROFILE, goal: "endurance" },
      { session: { plan: strength } },
    ),
    strength,
  );
  assert.deepEqual(
    getPlan(d, DEFAULT_PROFILE, { customPlan: endurance }),
    endurance,
  );
});
test("sessions clone plans, count sets, and recover active timers after reload", () => {
  const p = getPlan("2026-10-12", DEFAULT_PROFILE),
    s = createSession(p);
  s.plan.exercises[0].name = "Edited";
  assert.notEqual(s.plan.exercises[0].name, p.exercises[0].name);
  s.sets[0][0].done = true;
  assert.equal(completedSets(s), 1);
  s.elapsed = 12;
  s.runningSince = 1000;
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(elapsedSeconds(restored, 5500), 16);
  restored.runningSince = null;
  assert.equal(elapsedSeconds(restored, 999999), 12);
});
test("streak ignores incomplete sessions and handles today before completion", () => {
  const done = { session: { completedAt: "2026-10-16" } };
  const r = {
    "2026-10-15": done,
    "2026-10-16": done,
    "2026-10-17": emptyDay(),
  };
  assert.equal(streak(r, "2026-10-17"), 2);
  r["2026-10-17"] = done;
  assert.equal(streak(r, "2026-10-17"), 3);
  assert.equal(streak(r, "2026-10-19"), 0);
});
test("weight progress works in both directions and stays within bounds", () => {
  assert.equal(weightProgress(DEFAULT_PROFILE, 73.5), 50);
  assert.equal(weightProgress(DEFAULT_PROFILE, 76), 0);
  assert.equal(weightProgress(DEFAULT_PROFILE, 70), 100);
  assert.equal(
    weightProgress({ ...DEFAULT_PROFILE, targetWeight: 80 }, 77.5),
    50,
  );
  assert.equal(weightProgress(DEFAULT_PROFILE, null), 0);
});
test("coach reacts to missing and low-sleep logs rather than claiming readiness", () => {
  assert.match(
    coachInsights(emptyDay(), DEFAULT_PROFILE, totalNutrition())[0].text,
    /Log your sleep/,
  );
  assert.match(
    coachInsights(
      { ...emptyDay(), sleep: 5 },
      DEFAULT_PROFILE,
      totalNutrition(),
    )[0].text,
    /reduce your usual training load/,
  );
  assert.match(
    coachInsights(
      { ...emptyDay(), steps: 10000 },
      DEFAULT_PROFILE,
      totalNutrition(),
    )[2].text,
    /target is reached/,
  );
});
