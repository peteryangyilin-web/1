export const DEFAULT_PROFILE = {
  name: "Alex Morgan",
  goal: "muscle",
  age: null,
  height: null,
  experience: "intermediate",
  activity: "moderate",
  days: 4,
  calories: 2400,
  protein: 150,
  carbs: 280,
  fats: 75,
  steps: 10000,
  sleep: 8,
  water: 8,
  startWeight: 75,
  targetWeight: 72,
};
export const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDate = (key) => new Date(`${key}T12:00:00`);
export function weekDates(key, offset = 0) {
  const d = parseDate(key);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const v = new Date(d);
    v.setDate(v.getDate() + i);
    return dateKey(v);
  });
}
export function emptyDay() {
  return {
    meals: [],
    steps: null,
    sleep: null,
    weight: null,
    water: 0,
    session: null,
    customPlan: null,
  };
}
export function totalNutrition(meals = []) {
  return meals.reduce(
    (a, m) =>
      Object.fromEntries(
        Object.keys(a).map((k) => [k, a[k] + Number(m[k] || 0)]),
      ),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}
const exercise = (name, sets = 3, reps = 10) => ({ name, sets, reps });
const templates = {
  push: {
    title: "Push strength",
    type: "Strength",
    duration: 55,
    focus: "Chest · Shoulders · Triceps",
    exercises: [
      exercise("Barbell bench press"),
      exercise("Incline dumbbell press"),
      exercise("Seated shoulder press"),
      exercise("Lateral raises", 3, 12),
      exercise("Triceps rope pushdown", 3, 12),
    ],
  },
  lower: {
    title: "Lower body",
    type: "Strength",
    duration: 50,
    focus: "Quads · Glutes · Hamstrings",
    exercises: [
      exercise("Goblet squat"),
      exercise("Romanian deadlift"),
      exercise("Reverse lunge"),
      exercise("Calf raise", 3, 15),
    ],
  },
  pull: {
    title: "Pull strength",
    type: "Strength",
    duration: 50,
    focus: "Back · Biceps · Rear delts",
    exercises: [
      exercise("Lat pulldown"),
      exercise("Seated cable row"),
      exercise("Face pull", 3, 12),
      exercise("Dumbbell curl", 3, 12),
    ],
  },
  full: {
    title: "Full body",
    type: "Strength",
    duration: 45,
    focus: "A balanced session, head to toe",
    exercises: [
      exercise("Goblet squat"),
      exercise("Push-up"),
      exercise("Dumbbell row"),
      exercise("Dead bug", 3, 12),
    ],
  },
  cardio: {
    title: "Zone 2 cardio",
    type: "Endurance",
    duration: 35,
    focus: "Comfortable pace · Steady breathing",
    exercises: [
      exercise("Easy warm-up · 5 minutes", 1, 1),
      exercise("Steady cardio · 25 minutes", 1, 1),
      exercise("Cool-down · 5 minutes", 1, 1),
    ],
  },
  recovery: {
    title: "Active recovery",
    type: "Recovery",
    duration: 20,
    focus: "Mobility · Stretch · Reset",
    exercises: [
      exercise("Easy walk · 10 minutes", 1, 1),
      exercise("Hip mobility · 5 minutes", 1, 1),
      exercise("Shoulder mobility · 5 minutes", 1, 1),
    ],
  },
};
export function getPlan(key, profile, record) {
  if (record?.session?.plan) return record.session.plan;
  if (record?.customPlan) return record.customPlan;
  const index = (parseDate(key).getDay() + 6) % 7;
  const schedules = {
    3: [0, 2, 4],
    4: [0, 2, 4, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
  };
  const active = schedules[profile.days] || schedules[4];
  const slot = active.indexOf(index);
  const sequence =
    profile.goal === "endurance"
      ? ["cardio", "lower", "cardio", "full", "cardio", "pull"]
      : profile.goal === "wellbeing" || profile.goal === "fatloss"
        ? ["full", "cardio", "lower", "cardio", "push", "pull"]
        : ["push", "lower", "pull", "full", "cardio", "lower"];
  return templates[slot < 0 ? "recovery" : sequence[slot]];
}
export function createSession(plan) {
  return {
    plan: JSON.parse(JSON.stringify(plan)),
    sets: plan.exercises.map((e) =>
      Array.from({ length: e.sets }, () => ({
        reps: e.reps,
        weight: 0,
        done: false,
      })),
    ),
    elapsed: 0,
    runningSince: null,
    completedAt: null,
  };
}
export function elapsedSeconds(session, now = Date.now()) {
  return Math.max(
    0,
    Math.floor(
      (session?.elapsed || 0) +
        (session?.runningSince ? (now - session.runningSince) / 1000 : 0),
    ),
  );
}
export function completedSets(session) {
  return session?.sets?.flat().filter((x) => x.done).length || 0;
}
export function streak(records, today) {
  let d = parseDate(today),
    count = 0;
  if (!records[dateKey(d)]?.session?.completedAt) d.setDate(d.getDate() - 1);
  while (records[dateKey(d)]?.session?.completedAt) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
export const formatDuration = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
export function weightProgress(profile, weight) {
  if (weight == null) return 0;
  const span = Number(profile.targetWeight) - Number(profile.startWeight);
  if (span === 0) return 100;
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(((Number(weight) - Number(profile.startWeight)) / span) * 100),
    ),
  );
}
export function coachInsights(record, profile, totals) {
  return [
    {
      title:
        record.sleep == null
          ? "Start with your recovery"
          : record.sleep < 6
            ? "Give yourself room to recover"
            : "Keep your recovery consistent",
      text:
        record.sleep == null
          ? "Log your sleep to get a more useful suggestion for today."
          : record.sleep < 6
            ? "You logged less than 6 hours. Consider the recovery session or reduce your usual training load."
            : `You logged ${record.sleep} hours of sleep. Aim for your ${profile.sleep}-hour target and adjust training to how you feel.`,
    },
    {
      title: "Fuel the work",
      text:
        totals.protein < profile.protein
          ? `${Math.round(profile.protein - totals.protein)} g of protein remains toward your daily target. Build your next meal around a protein source you enjoy.`
          : "Your protein target is covered. Keep meals balanced and follow your appetite.",
    },
    {
      title: "Make movement manageable",
      text:
        record.steps == null
          ? "Add your step count to track your daily movement."
          : record.steps < profile.steps
            ? `${Math.max(0, profile.steps - record.steps).toLocaleString()} steps to your goal. A short walk is a good place to start.`
            : "Your step target is reached. Take a moment to enjoy that consistency.",
    },
  ];
}
