import React, { useEffect, useState, useRef } from "react";
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
  ArrowLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import "./overviewProfile.css";
import AnimalAvatar from "./AnimalAvatar";
import AnimalAvatarPicker, { characterName } from "./AnimalAvatarPicker";
import GoalArtwork from "./GoalArtwork";
import "./overviewExperience.css";
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
const BODY_TYPES = [
  { id: "lean", title: "Lean", text: "A lighter, defined look." },
  { id: "athletic", title: "Athletic", text: "Balanced strength and definition." },
  { id: "strong", title: "Strong", text: "A fuller, muscular build." },
];
function GenderSymbol({ gender }) {
  return <svg viewBox="0 0 80 80" className="gender-symbol" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx={gender === "male" ? 32 : 40} cy={gender === "male" ? 46 : 29} r="18" />
    {gender === "male" ? <path d="M45 33L65 13M51 13H65V27" /> : <path d="M40 47V70M28 60H52" />}
  </svg>;
}
export default function OverviewProfile({ profile, onSave, onTraining }) {
  const [draft, setDraft] = useState(profile),
    [step, setStep] = useState(0),
    [furthestStep, setFurthestStep] = useState(0),
    [editingAvatar, setEditingAvatar] = useState(false);
  const headingRef = useRef(null);
  const stepTitles = ["Choose your goal", "Tell us about you", "Choose your ideal body type", "Fill in your information"];
  const goToStep = (next) => { setFurthestStep(previous => Math.max(previous, next)); setStep(next); window.scrollTo({ top: 0, behavior: "instant" }); };
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => {
    setDraft(profile);
  }, [profile]);
  const set = (key, value) => {
    setDraft((p) => ({ ...p, [key]: value }));

  };
  const goal = GOALS.find((g) => g.id === draft.goal) || GOALS[0];
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
      className={`profile-overview overview-experience overview-step-${step}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (step !== 3) return;
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
        onTraining();
      }}
    >
      <nav className="wizard-progress" aria-label="Profile setup progress">
        {["Your goal", "About you", "Body type", "Your details"].map((label, index) => <button type="button" key={label} disabled={index > furthestStep} onClick={() => goToStep(index)} className={index <= step ? "reached" : ""} aria-current={index === step ? "step" : undefined} aria-label={`Step ${index + 1}: ${label}`}><span className="wizard-step-number">{index < step ? <Check size={12} /> : `0${index + 1}`}</span><span>{label}</span></button>)}
        <span className="wizard-time"><Clock size={13} /> About 2 min</span>
      </nav>
      <div className="wizard-heading">
        <span className="eyebrow">YOUR NEXT CHAPTER · STEP 0{step + 1} OF 04</span>
        <h2 ref={headingRef} tabIndex={-1}>{stepTitles[step]}</h2>
        <p>{["Start with what matters to you. We’ll take it from here.", "Choose an option to continue.", "Pick the direction that feels like you. You can change it anytime.", "Your starting point. Your rhythm. Your own pace."][step]}</p>
      </div>
      {step === 0 && <section className="profile-goal-section wizard-stage" key="goal">
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
                  onChange={() => { set("goal", g.id); goToStep(1); }}
                  onClick={() => { if (draft.goal === g.id) goToStep(1); }}
                />
                <span className="goal-card-top"><span className="goal-choice-icon"><Icon size={17} strokeWidth={1.5} /></span><span className="goal-card-index">0{GOALS.indexOf(g) + 1}</span></span>
                <GoalArtwork goal={g.id} />
                <span className="goal-radio">
                  {draft.goal === g.id && <Check size={11} />}
                </span>
                <strong>{g.title}</strong>
                <p>{g.text}</p>
                <span className="goal-card-continue">Let’s do this <ArrowUpRight size={17} /></span>
              </label>
            );
          })}
        </fieldset>
        <div className="goal-friendly-note"><span><ShieldCheck size={15} /> Your pace. Your starting point.</span><span>Choose one to continue. You can always change it.</span></div>
      </section>}
      {step === 1 && <section className="wizard-stage" key="gender">
        <div className="wizard-choices gender-choices" role="group" aria-label="Choose your gender">
          {[{id:"male",title:"Male"},{id:"female",title:"Female"}].map(option => <button type="button" key={option.id} className={"wizard-choice " + (draft.gender === option.id ? "selected" : "")} aria-pressed={draft.gender === option.id} onClick={() => { set("gender", option.id); goToStep(2); }}>
            <GenderSymbol gender={option.id} /><strong>{option.title}</strong><span>Continue <ArrowUpRight size={15} /></span>
          </button>)}
        </div>
      </section>}
      {step === 2 && <section className="wizard-stage" key="body">
        <div className="wizard-character-note"><span>Your avatar: <strong>{characterName(draft.avatarCharacter)}</strong></span><button type="button" onClick={() => setEditingAvatar(true)}>Change avatar <ArrowUpRight size={14} /></button></div>
        <div className="wizard-choices body-choices" role="group" aria-label="Choose your ideal body type">
          {BODY_TYPES.map(option => <button type="button" key={option.id} aria-label={option.title} className={"wizard-choice " + (draft.bodyType === option.id ? "selected" : "")} aria-pressed={draft.bodyType === option.id} onClick={() => { set("bodyType", option.id); goToStep(3); }}>
            <AnimalAvatar species={draft.avatarCharacter || "shiba"} build={option.id} /><strong>{option.title}</strong><p>{option.text}</p><span>Choose this direction <ArrowUpRight size={15} /></span>
          </button>)}
        </div>
        <p className="wizard-note">A personal preference, not a promised result. Your goal and weekly schedule guide your training.</p>
      </section>}
      {step === 3 && <div className="profile-content-grid wizard-stage" key="details">
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
          <div className="profile-summary-icon character-summary">
            <AnimalAvatar species={draft.avatarCharacter || "shiba"} build={draft.bodyType || "athletic"} />
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
              <dt>YOUR DIRECTION</dt>
              <dd>{BODY_TYPES.find(b => b.id === draft.bodyType)?.title || "—"} · {draft.gender === "female" ? "Female" : "Male"}</dd>
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
      </div>}
      {step === 3 && <div className="profile-save-bar">
        <span>Your profile stays on this device.</span>
        <div>
          <button type="submit" className="primary-button">
            Save your profile and go to training <ArrowUpRight size={15} />
          </button>
        </div>
      </div>}
      <div className="wizard-footer-actions">
      {step > 0 && <button type="button" className="wizard-back secondary-button" onClick={() => goToStep(step - 1)}><ArrowLeft size={15} /> Back</button>}
      {step === 1 && <button type="button" className="secondary-button wizard-avatar-trigger" aria-label="Select your avatar" onClick={() => setEditingAvatar(true)}><AnimalAvatar species={draft.avatarCharacter || "shiba"} /> Select your avatar <ArrowUpRight size={15} /></button>}
      </div>
      {editingAvatar && <AnimalAvatarPicker value={draft.avatarCharacter || "shiba"} onClose={() => setEditingAvatar(false)} onSelect={avatarCharacter => { set("avatarCharacter", avatarCharacter); setEditingAvatar(false); }} />}
    </form>
  );
}
