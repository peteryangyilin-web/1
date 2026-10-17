import React, { useEffect, useState } from "react";
import {
  Dumbbell,
  Activity,
  Heart,
  Target,
  ArrowUpRight,
  Check,
  UserRound,
  SlidersHorizontal,
  CalendarDays,
} from "lucide-react";
import "./overviewProfile.css";
const GOALS = [
  {
    id: "muscle",
    title: "Build muscle",
    text: "Build strength. Find your form.",
    icon: Dumbbell,
  },
  {
    id: "fatloss",
    title: "Lose fat",
    text: "Consistent movement. Balanced habits.",
    icon: Target,
  },
  {
    id: "endurance",
    title: "Improve endurance",
    text: "Go further, one session at a time.",
    icon: Activity,
  },
  {
    id: "wellbeing",
    title: "Feel healthier",
    text: "More energy for your everyday.",
    icon: Heart,
  },
];
export default function OverviewProfile({ profile, onSave, onTraining }) {
  const [draft, setDraft] = useState(profile),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    setDraft(profile);
  }, [profile]);
  const set = (key, value) => {
    setDraft((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };
  const goal = GOALS.find((g) => g.id === draft.goal) || GOALS[0],
    GoalIcon = goal.icon;
  const input = (label, key, min, max, step = 1, optional = false) => (
    <label className="field" key={key}>
      {label}
      {optional && <small>Optional</small>}
      <input
        name={key}
        type="number"
        value={draft[key] ?? ""}
        required={!optional}
        min={min}
        max={max}
        step={step}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  return (
    <form
      className="profile-overview"
      onSubmit={(e) => {
        e.preventDefault();
        const numeric = [
          "age",
          "height",
          "days",
          "calories",
          "protein",
          "carbs",
          "fats",
          "steps",
          "sleep",
          "water",
          "startWeight",
          "targetWeight",
        ];
        const next = { ...draft, name: draft.name.trim() };
        for (const key of numeric)
          next[key] =
            draft[key] === "" || draft[key] == null ? null : Number(draft[key]);
        onSave(next);
        setSaved(true);
      }}
    >
      <section className="profile-goal-section">
        <div className="profile-section-heading">
          <span className="section-number">01</span>
          <div>
            <h2>What are you working toward?</h2>
            <p>
              Choose the goal that feels right for you. You can change it
              anytime.
            </p>
          </div>
          <span className="profile-step-label">YOUR DIRECTION</span>
        </div>
        <fieldset className="goal-choices">
          <legend className="sr-only">Choose your fitness goal</legend>
          {GOALS.map((g) => {
            const Icon = g.icon;
            return (
              <label
                className={
                  "goal-choice " + (draft.goal === g.id ? "selected" : "")
                }
                key={g.id}
              >
                <input
                  type="radio"
                  name="goal"
                  value={g.id}
                  checked={draft.goal === g.id}
                  onChange={() => set("goal", g.id)}
                />
                <span className="goal-choice-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="goal-radio">
                  {draft.goal === g.id && <Check size={11} />}
                </span>
                <strong>{g.title}</strong>
                <p>{g.text}</p>
              </label>
            );
          })}
        </fieldset>
      </section>
      <div className="profile-content-grid">
        <div className="profile-main-column">
          <section className="panel profile-info-panel">
            <div className="profile-section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>A little about you.</h2>
                <p>Your starting point is your own.</p>
              </div>
              <UserRound size={18} />
            </div>
            <div className="form-grid">
              <label className="field">
                Your name
                <input
                  name="name"
                  value={draft.name}
                  required
                  maxLength="120"
                  pattern=".*\S.*"
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="What should we call you?"
                />
              </label>
              {input("Age · years", "age", 16, 100, 1, true)}
              {input("Height · cm", "height", 100, 250, 1, true)}
              {input("Starting weight · kg", "startWeight", 20, 500, 0.1)}
              {input("Target weight · kg", "targetWeight", 20, 500, 0.1)}
              <label className="field">
                Training experience
                <select
                  name="experience"
                  value={draft.experience || "intermediate"}
                  onChange={(e) => set("experience", e.target.value)}
                >
                  <option value="beginner">Just getting started</option>
                  <option value="intermediate">Some experience</option>
                  <option value="advanced">Training regularly</option>
                </select>
              </label>
            </div>
            <p className="profile-field-note">
              Age and height are optional profile information. Your goal and
              weekly frequency shape your training schedule.
            </p>
          </section>
          <section className="panel profile-rhythm-panel">
            <div className="profile-section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Make it fit your life.</h2>
                <p>Set a rhythm you can come back to.</p>
              </div>
              <CalendarDays size={18} />
            </div>
            <div className="form-grid">
              <label className="field">
                Sessions per week
                <select
                  name="days"
                  value={draft.days}
                  onChange={(e) => set("days", e.target.value)}
                >
                  {[3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} sessions
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Day-to-day activity
                <select
                  name="activity"
                  value={draft.activity || "moderate"}
                  onChange={(e) => set("activity", e.target.value)}
                >
                  <option value="light">Mostly sitting</option>
                  <option value="moderate">Some daily movement</option>
                  <option value="active">Frequently on my feet</option>
                </select>
              </label>
              {input("Daily steps", "steps", 100, 100000)}
              {input("Sleep target · hours", "sleep", 1, 16, 0.5)}
              {input("Water target · glasses", "water", 1, 20)}
            </div>
          </section>
          <section className="panel profile-targets-panel">
            <div className="profile-section-heading">
              <span className="section-number">04</span>
              <div>
                <h2>Fuel your own way.</h2>
                <p>Personal targets for your nutrition journal.</p>
              </div>
              <SlidersHorizontal size={18} />
            </div>
            <div className="form-grid">
              {input("Daily calories · kcal", "calories", 500, 10000)}
              {input("Protein · g", "protein", 1, 500)}
              {input("Carbs · g", "carbs", 1, 1000)}
              {input("Fats · g", "fats", 1, 500)}
            </div>
            <p className="profile-field-note">
              Set targets that are appropriate for you. These are preferences,
              not calculated dietary recommendations.
            </p>
          </section>
        </div>
        <aside className="profile-summary panel">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <div className="profile-summary-icon">
            <GoalIcon size={28} strokeWidth={1.3} />
          </div>
          <h2>
            Your goal.
            <br />
            Your own pace.
          </h2>
          <p>
            A clear starting point.
            <br />A little progress, every day.
          </p>
          <dl>
            <div>
              <dt>YOUR FOCUS</dt>
              <dd>{goal.title}</dd>
            </div>
            <div>
              <dt>YOUR WEEK</dt>
              <dd>
                {draft.days} sessions <span>/ week</span>
              </dd>
            </div>
            <div>
              <dt>YOUR STARTING POINT</dt>
              <dd>
                {draft.startWeight || "—"} <span>kg</span>
              </dd>
            </div>
            <div>
              <dt>YOUR TARGET</dt>
              <dd>
                {draft.targetWeight || "—"} <span>kg</span>
              </dd>
            </div>
          </dl>
          <div className="profile-summary-note">
            <Check size={14} />
            <span>
              Update your profile anytime. Completed sessions keep their
              original records.
            </span>
          </div>
        </aside>
      </div>
      <div className="profile-save-bar">
        <span>
          {saved ? (
            <>
              <Check size={15} />
              Profile saved.
            </>
          ) : (
            <>Make it yours. Save when you’re ready.</>
          )}
        </span>
        <div>
          <button
            type="button"
            className="secondary-button"
            onClick={onTraining}
          >
            Go to training <ArrowUpRight size={15} />
          </button>
          <button type="submit" className="primary-button">
            Save your profile <Check size={15} />
          </button>
        </div>
      </div>
    </form>
  );
}
