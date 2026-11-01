import React,{useState} from 'react';
import {Check,Plus,X} from 'lucide-react';
import {FOOD_CATALOG,searchFoods,estimateMeal} from '../foodCatalog';
import './guidedSetup.css';
export default function MealForm({meal,onSubmit,onPreset,presets=[],editing=false}){
 const [mode,setMode]=useState(meal?.items?.length?'foods':meal?'manual':'foods');
 const [items,setItems]=useState(meal?.items||[]),[query,setQuery]=useState('');
 const [name,setName]=useState(meal?.name||''),[nameEdited,setNameEdited]=useState(!!meal?.name);
 const [category,setCategory]=useState(meal?.category||'Lunch');
 const [values,setValues]=useState({calories:meal?.calories??'',protein:meal?.protein??'',carbs:meal?.carbs??'',fats:meal?.fats??''});
 let calculated={calories:0,protein:0,carbs:0,fats:0},error='';
 try{calculated=estimateMeal(items);if(calculated.calories>10000)error='This is a very large portion. Check the gram amounts before logging.';}catch(e){error=e.message;}
 const shown=mode==='foods'?calculated:values;
 const replaceItems=next=>{setItems(next);if(!nameEdited)setName(next.map(i=>FOOD_CATALOG.find(f=>f.id===i.foodId)?.name).filter(Boolean).join(' + ').slice(0,120));};
 const switchMode=next=>{if(next==='manual'&&mode==='foods'&&items.length&&!error)setValues(calculated);setMode(next);};
 return <>
  <span className="eyebrow">FUEL YOUR POTENTIAL</span><h2 id="modal-title">{editing?'Refine your plate.':'A little nourishment.'}</h2>
  <p>Choose foods and portions to calculate a serving, or enter values from a label.</p>
  <div className="food-mode-switch" role="group" aria-label="Meal entry method"><button type="button" aria-pressed={mode==='foods'} onClick={()=>switchMode('foods')}>Find food & calculate</button><button type="button" aria-pressed={mode==='manual'} onClick={()=>switchMode('manual')}>Enter values</button></div>
  <form onSubmit={e=>{e.preventDefault();if(mode==='foods'&&(!items.length||error))return;const nutrition=mode==='foods'?calculated:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v===''?null:Number(v)]));onSubmit({name:name.trim(),category,...nutrition,items:mode==='foods'?items.map(i=>({...i,grams:Number(i.grams)})):[],nutritionSource:mode==='foods'?'food-estimate':'manual'});}}>
   <label className="field">Meal name<input name="name" value={name} required maxLength="120" pattern={".*\\S.*"} placeholder="e.g. Lunch bowl" onChange={e=>{setName(e.target.value);setNameEdited(true);}}/></label>
   <label className="field">Meal type<select name="category" value={category} onChange={e=>setCategory(e.target.value)}>{['Breakfast','Lunch','Dinner','Snack','Meal'].map(c=><option key={c}>{c}</option>)}</select></label>
   {mode==='foods'&&<><label className="field">Search food<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rice, egg, tofu… or 米饭、鸡蛋"/></label><div className="food-search-results">{searchFoods(query).slice(0,6).map(food=><button type="button" key={food.id} aria-label={`Add ${food.name}`} onClick={()=>{const existing=items.find(i=>i.foodId===food.id);replaceItems(existing?items.map(i=>i.foodId===food.id?{...i,grams:Number(i.grams||0)+food.servingGrams}:i):[...items,{foodId:food.id,grams:food.servingGrams}]);setQuery('');}}><span>{food.name}<small>{food.servingGrams} g · {food.servingLabel} · {Math.round(food.calories*food.servingGrams/100)} kcal</small></span><Plus size={16}/></button>)}{!searchFoods(query).length&&<p className="food-estimate-note">No match yet. Try a common ingredient or choose Enter values to use your food label.</p>}</div>
    {items.map(item=>{const food=FOOD_CATALOG.find(f=>f.id===item.foodId);return food&&<div className="food-ingredient" key={item.foodId}><strong>{food.name}</strong><label>Grams<input aria-label={`${food.name} grams`} type="number" min="1" max="3000" step="0.1" required value={item.grams} onChange={e=>replaceItems(items.map(i=>i.foodId===item.foodId?{...i,grams:e.target.value}:i))}/></label><button type="button" aria-label={`Remove ${food.name}`} onClick={()=>replaceItems(items.filter(i=>i.foodId!==item.foodId))}><X size={16}/></button></div>})}
    <p className="food-estimate-note">Values are approximate generic estimates, not a brand-specific database. Weigh cooked foods as listed; dry oats are weighed dry. Oils and sauces count separately.</p>
    {!items.length&&<p className="food-estimate-note">Add at least one food above to calculate your meal.</p>}{error&&<p role="alert" className="food-estimate-note">{error}</p>}
   </>}
   <div className="meal-live-total" aria-live="polite"><strong>{shown.calories||0} kcal</strong><span>{mode==='foods'?'Calculated for the foods and portions above':'Values for your whole serving'}</span></div>
   <div className="form-grid">{[['Calories · kcal','calories',10000],['Protein · g','protein',1000],['Carbs · g','carbs',1000],['Fats · g','fats',1000]].map(([label,key,max])=><label className="field" key={key}>{label}<input name={key} type="number" min="0" max={max} step="0.1" value={shown[key]??''} readOnly={mode==='foods'} required={key==='calories'} placeholder={key==='calories'?'Enter calories':'Optional'} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
   {mode==='manual'&&<p className="food-estimate-note">Calories are enough to log a meal. Leave unknown macros blank; they will be marked as missing rather than invented.</p>}
   <button type="submit" disabled={mode==='foods'&&(!items.length||!!error)} className="primary-button full-width">{editing?'Save meal':'Log meal'} <Check size={16}/></button>
  </form>
  {!editing&&!meal&&<div className="quick-add"><span className="eyebrow">QUICK ADD · ESTIMATED SERVINGS</span>{presets.map(p=><button type="button" key={p.name} onClick={()=>onPreset({...p,category:'Meal',nutritionSource:'preset-estimate'})}><div><strong>{p.name}</strong><small>{p.calories} kcal · {p.protein} g protein</small></div><Plus size={17}/></button>)}</div>}
 </>;
}
