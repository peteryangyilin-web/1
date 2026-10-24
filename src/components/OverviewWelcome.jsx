import React, { useState } from "react";
import { ArrowUpRight, Dumbbell, CalendarDays, Leaf, Heart, Pause, Play, ChartNoAxesCombined } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import "./overviewWelcome.css";

function PreviewCards({ profile }) {
  const calories = Number(profile.calories || 2400).toLocaleString();
  return <>
        <article className="welcome-preview-card welcome-habit-card"><Heart size={23} /><h2>A little better,<br />every day.</h2><p>Your own starting point.<br />Your own kind of stronger.</p><div className="welcome-mini-dots">{Array.from({length:7},(_,i)=><i key={i} />)}</div></article>
        <article className="welcome-preview-card welcome-training-card"><div className="welcome-card-caption"><Dumbbell size={15} /><span>Training</span><small>EXAMPLE SESSION</small></div><h2>One rep closer.</h2><p>Push strength. A few good sets.<br />A moment to show up for yourself.</p><div className="welcome-training-tags"><span>Strength</span><span>At your pace</span></div><div className="welcome-card-bottom"><CalendarDays size={13} /><span>A plan built around your week</span></div></article>
        <article className="welcome-preview-card welcome-character-card"><span className="welcome-card-caption">A LITTLE PERSONALITY</span><AnimalAvatar species={profile.avatarCharacter || "shiba"} gender={profile.gender || "male"} build={profile.bodyType || "lean"} /><div><h2>Your kind of GO.</h2><p>Choose a character. Make it yours.</p></div></article>
        <div className="welcome-preview-stack"><article className="welcome-preview-card welcome-target-card"><div><h2>Your daily rhythm</h2><p>{calories} kcal target<br />{profile.protein || 150}g protein target</p></div><Leaf size={26} /></article><article className="welcome-preview-card welcome-progress-card"><div><h2>Room to grow.</h2><p>Small steps.<br />A little more you.</p></div><ChartNoAxesCombined size={29} /></article></div>
        <article className="welcome-preview-card welcome-recovery-card"><span className="welcome-card-caption">BETTER, TOGETHER</span><h2>Move.<br />Rest.<br />Repeat.</h2><p>Build a routine that fits your life.</p><Heart size={23} /></article>
  </>;
}

export default function OverviewWelcome({ profile, onStart }) {
  const [paused, setPaused] = useState(false);
  return <section className="overview-welcome" aria-labelledby="overview-welcome-title">
    <div className="welcome-quiet-label"><span /> A LITTLE BETTER, EVERY DAY</div>
    <div className="welcome-center">
      <h1 id="overview-welcome-title">Let’s make it yours.</h1>
      <p>Your training. Your habits. Your own pace.<br className="welcome-mobile-break" /> A little space to grow stronger.</p>
      <div className="welcome-actions"><button type="button" className="welcome-cta welcome-cta-dark" onClick={onStart}>Get started <ArrowUpRight size={14} /></button></div>
    </div>
    <div className="welcome-card-viewport" data-paused={paused} role="region" aria-label="A preview of your GO experience" tabIndex={0}>
      <div className="welcome-card-track">
        {[0, 1].map(copy => <div className="welcome-card-group" key={copy} aria-hidden={copy === 1 ? true : undefined} inert={copy === 1 ? true : undefined}>
          <PreviewCards profile={profile} />
        </div>)}
      </div>
    </div>
    <div className="welcome-bottom-note"><span>BUILT AROUND YOU.</span><button type="button" className="welcome-motion-toggle" aria-label={paused ? "Resume card animation" : "Pause card animation"} onClick={() => setPaused(value => !value)}>{paused ? <Play size={12} /> : <Pause size={12} />}{paused ? "Play" : "Pause"}</button><span>TRAINING · NUTRITION · PROGRESS</span></div>
  </section>;
}
