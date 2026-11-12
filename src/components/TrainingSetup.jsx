import React,{useState} from 'react';
import {WEEKDAYS,screenHealth} from '../trainingPlanner';
import './trainingSetup.css';
import './trainingGuidance.css';
const Select=({label,value,onChange,options})=><label className="field">{label}<select aria-label={label} required value={value??''} onChange={e=>onChange(e.target.value)}><option value="" disabled>Choose an answer</option>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>;
export default function TrainingSetup({profile,onSave}){
 const [draft,setDraft]=useState(()=>({...profile.trainingSetup,age:profile.age??'',goal:profile.goal||({hypertrophy:'muscle',fat_loss:'fatloss',general_health:'wellbeing'})[profile.primary_goal]||profile.primary_goal||'wellbeing',windows:profile.trainingSetup?.windows||[],health:profile.trainingSetup?.health||{},currentActivity:profile.trainingSetup?.currentActivity||{}}));
 const [step,setStep]=useState(0),[error,setError]=useState('');
 const set=(k,v)=>setDraft(s=>({...s,[k]:v}));
 return <><h2 id="modal-title">Your training setup</h2><p className="setup-help">Three short steps. Your calendar, equipment and current abilities shape a realistic starting plan.</p><div className="training-setup-steps" aria-label="Training setup steps">{['Experience','Your week','Health check'].map((s,i)=><span key={s} aria-current={i===step?'step':undefined}>{i+1}. {s}</span>)}</div>
 <form key={step} onSubmit={e=>{e.preventDefault();setError('');if(step===1&&draft.windows.length===0){setError('Choose at least one weekday and its available minutes.');return;}if(step<2){setStep(step+1);return;}const health=screenHealth(draft.health);if(health.status==='needs_input'){setError('Answer all four health questions.');return;}onSave({...draft,updatedAt:new Date().toISOString()});}}>
 {step===0&&<>
 <label className="field">Age · years<input required type="number" min="5" max="110" value={draft.age} onChange={e=>set('age',e.target.value)}/></label>
 <Select label="Main training focus" value={draft.goal} onChange={v=>set('goal',v)} options={[["muscle","Build muscle"],["fatloss","Lose fat"],["endurance","Improve endurance"],["wellbeing","Feel healthier"],["strength","Build strength"]]}/>
 <Select label="Recent training history" value={draft.history} onChange={v=>set('history',v)} options={[["beginner","Starting out · no consistent recent resistance training"],["returning","Returning · trained before, but recently stopped"],["intermediate","Regular · consistent recent training and records"],["advanced","Experienced · established training and reliable logs"]]}/>
 <Select label="Movement familiarity" value={draft.technique} onChange={v=>set('technique',v)} options={[["needs_instruction","I need instruction in basic lifting movements"],["familiar","I can control basic movements with a light load"]]}/>
 <Select label="Comfortable continuous movement" value={draft.capacity} onChange={v=>set('capacity',Number(v))} options={[["5","About 5 minutes"],["10","About 10 minutes"],["20","About 20 minutes"],["40","About 40 minutes"]]}/>
 <p className="setup-help">At a comfortable pace, without unusual symptoms. This is not a maximal fitness test.</p>
 <label className="training-check"><input type="checkbox" checked={draft.currentActivity.unknown===true} onChange={e=>set('currentActivity',{...draft.currentActivity,unknown:e.target.checked})}/>I’m not sure how much aerobic activity I currently do</label>
 {!draft.currentActivity.unknown&&<div className="form-grid">{[['moderate_minutes_per_week','Moderate minutes per week'],['vigorous_minutes_per_week','Vigorous minutes per week']].map(([k,l])=><label key={k} className="field">{l}<input required type="number" min="0" max={k.startsWith('moderate')?3000:1500} value={draft.currentActivity[k]??''} onChange={e=>set('currentActivity',{...draft.currentActivity,[k]:e.target.value})}/></label>)}</div>}
 <p className="setup-help">Moderate: you can talk but cannot sing. Vigorous: only a few words before a breath. Enter 0 if you do none.</p></>}
 {step===1&&<>
 <Select label="Equipment available" value={draft.equipment} onChange={v=>set('equipment',v)} options={[["gym","Gym · dumbbells, bench, cables and machines"],["dumbbells","Dumbbells · plus a stable seat and floor space"],["bodyweight","No equipment · alternatives may need a coach"]]}/>
 <p className="setup-help">Pick the days you can train. Available days are a limit, not a requirement to exercise every day. Each window includes warm-up, working sets, rest and cool-down. Other days stay free.</p>
 <div className="training-windows">{WEEKDAYS.map((day,index)=>{const w=draft.windows.find(w=>w.day===index);return <div key={day}><label className="training-check"><input type="checkbox" checked={!!w} onChange={e=>set('windows',e.target.checked?[...draft.windows,{day:index,minutes:30}].sort((a,b)=>a.day-b.day):draft.windows.filter(w=>w.day!==index))}/>{day}</label>{w&&<label>{day} minutes<input aria-label={`${day} minutes`} required type="number" min="10" max="120" step="1" value={w.minutes} onChange={e=>set('windows',draft.windows.map(x=>x.day===index?{...x,minutes:e.target.value}:x))}/></label>}</div>})}</div>
 <label className="training-check"><input type="checkbox" checked={draft.lowImpact===true} onChange={e=>set('lowImpact',e.target.checked)}/>I prefer lower-impact movement or extra support</label>
 <Select label="Cardio preference" value={draft.cardio||'walking'} onChange={v=>set('cardio',v)} options={[["walking","Walking"],["run-walk","Gentle run/walk · only if comfortable"]]}/>
 </>}
 {step===2&&<>
 <p className="setup-help">These answers help route you to general guidance or an individual assessment. They are not medical clearance. Answers are saved with your profile and can be viewed by GO administrators under the privacy notice.</p>
 {[["warningSymptoms","Current chest pain, fainting or unusual breathlessness?"],["knownCondition","Known heart, metabolic or kidney condition?"],["currentPain","Current joint pain, injury or movement limitation?"],["specialCare","Pregnant, postpartum, post-surgery or seeking rehabilitation?"]].map(([k,label])=><Select key={k} label={label} value={draft.health[k]} onChange={v=>{const health={...draft.health,[k]:v};set('health',health);if(k==='warningSymptoms'&&v==='yes')onSave({...draft,health,updatedAt:new Date().toISOString()});}} options={[["no","No"],["yes","Yes"],["unsure","Not sure / needs checking"]]}/>)}
 <p className="setup-help">If symptoms are severe or persistent, seek urgent medical help. GO currently supports a general adult starting plan; specialist pathways need a qualified professional.</p>
 </>}
 {error&&<p role="alert" className="account-alert">{error}</p>}
 <div className="modal-actions">{step>0&&<button type="button" className="secondary-button" onClick={()=>setStep(step-1)}>Back</button>}<button className="primary-button">{step<2?'Continue':'Save training setup'}</button></div>
 </form></>;
}
