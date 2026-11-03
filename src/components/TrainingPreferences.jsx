import React from 'react';
import {TRAINING_FIELDS} from '../trainingPlanner';
import './trainingGuidance.css';
export default function TrainingPreferences({profile,onChange}){
 const field=f=><label className="field" key={f.name}>{f.label}<select aria-label={f.label} name={f.name} {...(onChange?{value:profile[f.name]??f.fallback,onChange:e=>onChange(f.name,e.target.value)}:{defaultValue:profile[f.name]??f.fallback})}>{f.options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><small className="field-help">{f.help}</small></label>;
 return <section className="training-preferences"><h3>Your training setup</h3><p className="setup-help">These answers change your exercises and starting dose. Update them as your capacity changes.</p><div className="form-grid">{TRAINING_FIELDS.slice(0,3).map(field)}</div><details><summary>Movement preferences & individual needs</summary><div className="form-grid">{TRAINING_FIELDS.slice(3).map(field)}</div></details></section>;
}
