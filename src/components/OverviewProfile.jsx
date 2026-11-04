import React, { useEffect, useState, useRef } from "react";
import {
  Dumbbell,
  Activity,
  Heart,
  Target,
  ArrowUpRight,
  Check,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import "./overviewProfile.css";
import AnimalAvatar from "./AnimalAvatar";
import AnimalAvatarPicker, { characterName } from "./AnimalAvatarPicker";
import GoalArtwork from "./GoalArtwork";
import "./overviewExperience.css";
import { getProfileGuidance } from "../profileGuidance";
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
export default function OverviewProfile({ profile, onSave, onTraining, cloudAccount=false }) {
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
  const input = (label, key, min, max, step = 1) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <input
        name={key}
        aria-label={label}
        type="number"
        value={draft[key] ?? ""}
        required
        inputMode={step === 1 ? "numeric" : "decimal"}
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
        const manualTargets = draft.targetsSource === "manual";
        const guidance = getProfileGuidance(draft);
        const next = { ...draft, ...(!manualTargets ? guidance.targets : {}), targetsSource: manualTargets ? "manual" : "suggested", name: String(draft.name || "").trim() };
        for (const key of numeric)
          next[key] =
            next[key] === "" || next[key] == null ? null : Number(next[key]);
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
        <div className="wizard-heading-row">
          <h2 ref={headingRef} tabIndex={-1}>{stepTitles[step]}</h2>
      {step === 1 && <button type="button" className="secondary-button wizard-avatar-trigger" aria-label="Select your avatar" onClick={() => setEditingAvatar(true)}><AnimalAvatar showMuscles={false} gender={draft.gender || "male"} species={draft.avatarCharacter || "shiba"} /> Select your avatar <ArrowUpRight size={15} /></button>}
        </div>
        <p>{["Start with what matters to you. We’ll take it from here.", "Choose an option to continue.", "Pick the direction that feels like you. You can change it anytime.", "Four quick details. Then you’re ready."][step]}</p>
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
            <AnimalAvatar gender={draft.gender || "male"} species={draft.avatarCharacter || "shiba"} build={option.id} /><strong>{option.title}</strong><p>{option.text}</p><span>Choose this direction <ArrowUpRight size={15} /></span>
          </button>)}
        </div>
        <p className="wizard-note">A personal preference, not a promised result. Your goal and weekly schedule guide your training.</p>
      </section>}
      {step === 3 && <section className="panel setup-basics wizard-stage" key="details" aria-label="Your basic information">
        <div className="setup-basics-fields form-grid">
          {input("Age · years", "age", 16, 100)}
          {input("Height · cm", "height", 100, 250, .1)}
          {input("Weight · kg", "startWeight", 20, 500, .1)}
          {input("Days available per week", "days", 1, 7)}
        </div>
        <div className="setup-basics-preview character-summary" aria-label="Your selected avatar">
          <AnimalAvatar gender={draft.gender || "male"} species={draft.avatarCharacter || "shiba"} build={draft.bodyType || "athletic"} />
        </div>
      </section>}
      {step === 3 && <div className="profile-save-bar">
        <span>{cloudAccount?"Your profile syncs to your GO account.":"Your profile stays on this device."}</span>
        <div>
          <button type="submit" className="primary-button">
            Save your profile and go to training <ArrowUpRight size={15} />
          </button>
        </div>
      </div>}
      <div className="wizard-footer-actions">
      {step > 0 && <button type="button" className="wizard-back secondary-button" onClick={() => goToStep(step - 1)}><ArrowLeft size={15} /> Back</button>}
      </div>
      {editingAvatar && <AnimalAvatarPicker gender={draft.gender || "male"} value={draft.avatarCharacter || "shiba"} onClose={() => setEditingAvatar(false)} onSelect={avatarCharacter => { set("avatarCharacter", avatarCharacter); setEditingAvatar(false); }} />}
    </form>
  );
}
