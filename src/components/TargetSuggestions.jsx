import React from 'react';
import {Sparkles, ArrowUpRight} from 'lucide-react';
import {getProfileGuidance} from '../profileGuidance';
import './guidedSetup.css';
export default function TargetSuggestions({profile,onApply,applied=false}){
 const guide=getProfileGuidance(profile);
 return <section className="target-guide" aria-label="Personalized starting targets">
  <span className="guide-kicker"><Sparkles size={16}/> GO GOAL GUIDE · {guide.label}</span>
  <h3>A starting point, explained.</h3><p>{guide.reasons}</p>
  {guide.energy?<><div className="guide-energy"><strong>{guide.energy.low.toLocaleString()}–{guide.energy.high.toLocaleString()} <small>kcal / day</small></strong><span>Estimated starting range · suggested midpoint {guide.targets.calories.toLocaleString()} kcal</span></div><details className="guide-explanation"><summary>Why these numbers?</summary><p>A broad Mifflin–St Jeor estimate uses your age, height, current weight and activity. The range spans both formula variants and is independent of your avatar’s gender. {profile.goal==='muscle'?'A modest 150 kcal is added for your muscle-building goal.':guide.energy.adjustment===-250?'A modest 250 kcal reduction is used; no aggressive deficit is suggested.':'Your estimate starts around maintenance energy.'} These are estimates, not a prescribed intake. Review your energy, appetite and trends after 2–4 weeks.</p><p>Protein supports recovery, carbs fuel movement, and fats support normal body functions. Suggested grams are rounded so their energy approximately matches your calorie target.</p></details></>:<p className="guide-empty">{guide.missing}</p>}
  <div className="guide-habits">{guide.habits.map(h=><div key={h.key}><span>{h.label}</span><strong>{h.value}</strong><p>{h.reason}</p></div>)}</div>
  {profile.startWeight>0&&<div className="guide-weight"><strong>{guide.targets.targetWeight} kg · four-week starting direction</strong><p>{guide.weightNote}</p></div>}
  <button type="button" className="secondary-button" onClick={()=>onApply(guide.targets)}>{applied?'Refresh starting targets':'Use suggested targets'} <ArrowUpRight size={15}/></button>
  <small className="guide-source">Calculated on this device from your profile. All targets stay editable.</small>
 </section>;
}
