import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, X, Dumbbell, CalendarDays, Leaf, Check, Heart, Play, ChartNoAxesCombined } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import "./overviewWelcome.css";

const DEMO_TABS = ["Training", "Nutrition", "Progress"];
function PreviewDialog({ profile, onClose, onStart }) {
  const dialog = useRef(null);
  const [tab, setTab] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const setDemoTab = (event, index) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + 3) % 3;
      setTab(next);
      dialog.current.querySelectorAll('[role="tab"]')[next].focus();
    }
  };
  return <dialog ref={dialog} className="welcome-demo" aria-labelledby="welcome-demo-title" onCancel={onClose} onKeyDown={event => { if (["Escape", "Tab"].includes(event.key)) event.stopPropagation(); }} onClick={event => {
    if (event.target !== dialog.current) return;
    const box = dialog.current.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
  }}>
    <div className="welcome-demo-heading"><div><span className="welcome-overline">EXAMPLE PREVIEW</span><h2 id="welcome-demo-title">A look inside GO</h2></div><button type="button" className="icon-button" aria-label="Close preview" onClick={onClose}><X size={20} /></button></div>
    <p className="welcome-demo-intro">A place for your training, your habits, and your own kind of progress.</p>
    <div className="welcome-demo-tabs" role="tablist" aria-label="Explore GO features">{DEMO_TABS.map((label, index) => <button type="button" role="tab" id={`welcome-demo-tab-${index}`} aria-controls="welcome-demo-panel" aria-selected={tab === index} tabIndex={tab === index ? 0 : -1} key={label} onClick={() => setTab(index)} onKeyDown={event => setDemoTab(event, index)}>{label}</button>)}</div>
    <div className="welcome-demo-screen" id="welcome-demo-panel" role="tabpanel" aria-labelledby={`welcome-demo-tab-${tab}`} tabIndex={0}>
      {tab === 0 ? <>
        <div className="welcome-demo-screen-top"><span className="welcome-overline">YOUR WEEK, WITH ROOM TO BREATHE</span><Dumbbell size={20} /></div>
        <div className="welcome-demo-week">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className={index === 2 ? "selected" : ""} key={index}>{day}<i>{index + 12}</i></span>)}</div>
        <h3>Push strength</h3><p>Chest · Shoulders · Triceps</p>
        <div className="welcome-demo-exercises"><span><i><Check size={12} /></i> Warm up <small>5 min</small></span><span><i>02</i> Bench press <small>3 × 10</small></span><span><i>03</i> Shoulder press <small>3 × 12</small></span></div>
        <div className="welcome-demo-caption">Choose a session. Follow the form demos. Log your sets.</div>
      </> : tab === 1 ? <>
        <div className="welcome-demo-screen-top"><span className="welcome-overline">SMALL HABITS. STEADY ENERGY.</span><Leaf size={20} /></div>
        <h3>A little nourishment.</h3><p>Keep meals, water, and your personal targets together.</p>
        <div className="welcome-demo-food"><span>Greek yogurt & berries<small>Example meal · breakfast</small></span><Leaf size={26} /></div>
        <div className="welcome-demo-targets"><span><strong>{Number(profile.calories || 2400).toLocaleString()}</strong><small>kcal target</small></span><span><strong>{profile.protein || 150}g</strong><small>protein target</small></span><span><strong>{profile.water || 8}</strong><small>glasses target</small></span></div>
        <div className="welcome-demo-caption">These are your saved targets. Meals shown here are examples.</div>
      </> : <>
        <div className="welcome-demo-screen-top"><span className="welcome-overline">SEE THE BIGGER PICTURE</span><ChartNoAxesCombined size={20} /></div>
        <h3>One day becomes a habit.</h3><p>Log your activity, look back at your sessions, and notice your progress.</p>
        <div className="welcome-demo-chart" role="img" aria-label="Example activity chart, not your logged data">{[35, 62, 46, 78, 57, 88, 72].map((height, index) => <span key={index}><i style={{height:`${height}%`}} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></span>)}</div>
        <div className="welcome-demo-caption">An example view. Your real charts start with the data you log.</div>
      </>}
    </div>
    <div className="welcome-demo-footer"><span>No rush. Start where you are.</span><button type="button" className="welcome-cta welcome-cta-dark" onClick={onStart}>Get started <ArrowRight size={14} /></button></div>
  </dialog>;
}

export default function OverviewWelcome({ profile, onStart }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const calories = Number(profile.calories || 2400).toLocaleString();
  return <section className="overview-welcome" aria-labelledby="overview-welcome-title">
    <div className="welcome-quiet-label"><span /> A LITTLE BETTER, EVERY DAY</div>
    <div className="welcome-center">
      <h1 id="overview-welcome-title">Let’s make it yours.</h1>
      <p>Your training. Your habits. Your own pace.<br className="welcome-mobile-break" /> A little space to grow stronger.</p>
      <div className="welcome-actions"><button type="button" className="welcome-cta welcome-cta-light" onClick={() => setDemoOpen(true)}>View demo <Play size={12} fill="currentColor" /></button><button type="button" className="welcome-cta welcome-cta-dark" onClick={onStart}>Get started <ArrowUpRight size={14} /></button></div>
    </div>
    <div className="welcome-card-viewport" aria-label="A preview of your GO experience" tabIndex={0}>
      <div className="welcome-card-track">
        <article className="welcome-preview-card welcome-habit-card"><Heart size={23} /><h2>A little better,<br />every day.</h2><p>Your own starting point.<br />Your own kind of stronger.</p><div className="welcome-mini-dots">{Array.from({length:7},(_,i)=><i key={i} />)}</div></article>
        <article className="welcome-preview-card welcome-training-card"><div className="welcome-card-caption"><Dumbbell size={15} /><span>Training</span><small>EXAMPLE SESSION</small></div><h2>One rep closer.</h2><p>Push strength. A few good sets.<br />A moment to show up for yourself.</p><div className="welcome-training-tags"><span>Strength</span><span>At your pace</span></div><div className="welcome-card-bottom"><CalendarDays size={13} /><span>A plan built around your week</span></div></article>
        <article className="welcome-preview-card welcome-character-card"><span className="welcome-card-caption">A LITTLE PERSONALITY</span><AnimalAvatar species={profile.avatarCharacter || "shiba"} gender={profile.gender || "male"} build={profile.bodyType || "lean"} /><div><h2>Your kind of GO.</h2><p>Choose a character. Make it yours.</p></div></article>
        <div className="welcome-preview-stack"><article className="welcome-preview-card welcome-target-card"><div><h2>Your daily rhythm</h2><p>{calories} kcal target<br />{profile.protein || 150}g protein target</p></div><Leaf size={26} /></article><article className="welcome-preview-card welcome-progress-card"><div><h2>Room to grow.</h2><p>Small steps.<br />A little more you.</p></div><ChartNoAxesCombined size={29} /></article></div>
        <article className="welcome-preview-card welcome-recovery-card"><span className="welcome-card-caption">BETTER, TOGETHER</span><h2>Move.<br />Rest.<br />Repeat.</h2><p>Build a routine that fits your life.</p><Heart size={23} /></article>
      </div>
    </div>
    <div className="welcome-bottom-note"><span>BUILT AROUND YOU.</span><span>TRAINING · NUTRITION · PROGRESS</span></div>
    {demoOpen && <PreviewDialog profile={profile} onClose={() => setDemoOpen(false)} onStart={() => { setDemoOpen(false); onStart(); }} />}
  </section>;
}
