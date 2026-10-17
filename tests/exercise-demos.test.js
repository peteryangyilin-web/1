import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getExerciseDemo, EXERCISE_DEMOS } from "../src/exerciseDemos.js";
import { getPlan, weekDates, DEFAULT_PROFILE } from "../src/model.js";

test("every built-in recommended exercise resolves to a real bundled animation and poster", () => {
  const names = new Set();
  for (const goal of ["muscle", "endurance", "wellbeing"])
    for (const days of [3, 4, 5, 6])
      for (const date of weekDates("2026-10-16"))
        for (const exercise of getPlan(date, { ...DEFAULT_PROFILE, goal, days })
          .exercises)
          names.add(exercise.name);
  assert.ok(names.size >= 22);
  for (const name of names) {
    const demo = getExerciseDemo(name);
    assert.ok(demo, `Missing matching demonstration: ${name}`);
    const gif = new URL(`../public/exercises/${demo.id}.gif`, import.meta.url),
      poster = new URL(`../public/exercises/${demo.id}.png`, import.meta.url);
    assert.equal(readFileSync(gif).subarray(0, 6).toString(), "GIF89a");
    assert.ok(existsSync(poster));
    assert.ok(demo.cues.length >= 3);
  }
});
test("specific variations keep the correct movements and unknown exercises do not receive a misleading demo", () => {
  assert.equal(getExerciseDemo("Incline dumbbell press").id, "incline");
  assert.equal(getExerciseDemo("Barbell bench press").id, "bench");
  assert.equal(getExerciseDemo("Seated cable row").id, "row");
  assert.equal(getExerciseDemo("Dumbbell row").id, "dumbbellrow");
  assert.equal(getExerciseDemo("Shoulder mobility · 5 minutes").id, "mobility");
  assert.equal(getExerciseDemo("深蹲").id, "squat");
  assert.equal(getExerciseDemo("My custom balance movement"), null);
});
test("exercise loops have finite joint positions and actually change pose", () => {
  for (const demo of Object.values(EXERCISE_DEMOS)) {
    assert.equal(demo.frames.length, 4);
    assert.notDeepEqual(demo.frames[0], demo.frames[1], demo.id + " must move");
    for (const pose of demo.frames)
      for (const [key, value] of Object.entries(pose)) {
        if (Array.isArray(value)) {
          assert.equal(value.length, 2);
          assert.ok(value.every(Number.isFinite), `${demo.id}: invalid ${key}`);
        }
      }
  }
});
