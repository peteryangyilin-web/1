import React from 'react';
import {ArrowUpRight} from 'lucide-react';
import {TRAINING_SOURCES} from '../trainingPlanner';
import './trainingGuidance.css';
export default function TrainingGuidance({plan,onEdit}){
 if(!plan.plannerVersion)return <div className="training-personalization"><p>This saved/custom plan keeps its original prescription. Your current profile shapes new, unstarted days.</p><button type="button" className="text-button" onClick={onEdit}>Review training information <ArrowUpRight size={14}/></button></div>;
 return <section className="training-personalization" aria-label="Why this plan fits you">
  <div className="personalization-heading"><div><span className="eyebrow">BUILT FROM YOUR STARTING POINT</span><h3>Why this plan fits you.</h3></div><button type="button" className="secondary-button" onClick={onEdit}>Update training info <ArrowUpRight size={14}/></button></div>
  {plan.blocked?<p role="status">{plan.rationale}</p>:<><div className="training-dose-grid"><div><strong>{plan.weekly.strengthDays}</strong><span>strength days / week</span></div><div><strong>{plan.weekly.moderateMinutes} min</strong><span>planned moderate cardio / week</span></div><div><strong>{plan.effort||'Easy movement'}</strong><span>your effort guide</span></div></div><p>{plan.weekly.reference}</p><p>{plan.weekly.gap}</p>{plan.weekly.balanceDays>0&&<p>Supported balance practice: {plan.weekly.balanceDays} days per week, in addition to strength and aerobic work.</p>}</>}
  <details><summary>Your inputs & the decisions they change</summary><ul>{plan.profileReasons.map(reason=><li key={reason}>{reason}</li>)}</ul>{plan.assumptions.length>0&&<p><strong>Starting assumptions to review:</strong> {plan.assumptions.join('; ')}.</p>}<p>Update your information above. Existing sessions and custom plans keep their original settings.</p></details>
  {!plan.blocked&&<details><summary>How to choose a weight & progress</summary><p>{plan.loading}</p><p>{plan.progression}</p><p>A session can share movements with another user while differing in volume, rest and progression. We do not invent different exercises just to make plans look different.</p></details>}
  <details><summary>Evidence & how GO uses it</summary><p>{plan.method} The references support general exercise principles, not a guarantee of individual results or endorsement of GO.</p><ul>{TRAINING_SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} <ArrowUpRight size={13}/></a></li>)}</ul></details>
 </section>;
}
