import {completeProfile} from './fixtures/training-profile.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getProfileGuidance,ACTIVITY_OPTIONS,GLASS_ML} from '../src/profileGuidance.js';
import {estimateMeal,searchFoods} from '../src/foodCatalog.js';
import {DEFAULT_PROFILE,getPlan,weekDates,createSession} from '../src/model.js';
const base={...DEFAULT_PROFILE,age:30,height:170,startWeight:75,activity:'light',days:3,cardioCapacity:20};
test('adult goal suggestions have modest direction, a range and coherent macro energy',()=>{
 const muscle=getProfileGuidance({...base,goal:'muscle'}),fat=getProfileGuidance({...base,goal:'fatloss'}),endurance=getProfileGuidance({...base,goal:'endurance'});
 assert.ok(muscle.targets.calories>endurance.targets.calories);assert.ok(fat.targets.calories<endurance.targets.calories);
 assert.equal(fat.targets.targetWeight,73.5);assert.equal(endurance.targets.targetWeight,75);assert.ok(muscle.targets.targetWeight>75);
 for(const goal of ['muscle','fatloss','endurance','wellbeing']){const g=getProfileGuidance({...base,goal});assert.ok(g.energy.low<=g.targets.calories&&g.targets.calories<=g.energy.high);assert.ok(Math.abs(4*g.targets.protein+4*g.targets.carbs+9*g.targets.fats-g.targets.calories)<5);assert.equal(g.targets.water*GLASS_ML,2000);}
 assert.deepEqual(getProfileGuidance({...base,gender:'male'}).targets,getProfileGuidance({...base,gender:'female'}).targets,'Avatar gender must not silently choose a physiological formula');
});
test('missing data, under-18s and unsuitable measurements never get invented calorie deficits',()=>{
 for(const p of [{...base,age:null},{...base,age:17},{...base,height:100},{...base,startWeight:35}]){const g=getProfileGuidance({...p,goal:'fatloss'});assert.equal(g.energy,null);assert.equal(g.targets.calories,null);assert.equal(g.targets.protein,null);assert.ok(g.missing.length>20);}
 assert.match(ACTIVITY_OPTIONS.find(o=>o.id==='active').definition,/4 hours/);
});
test('four goals really produce different unstarted weekly plans and experience changes volume',()=>{
 const dates=weekDates('2026-10-12');const plans=new Set();
 for(const goal of ['muscle','fatloss','endurance','wellbeing'])plans.add(JSON.stringify(dates.map(d=>getPlan(d,completeProfile({goal})))));assert.equal(plans.size,4);
 const a=getPlan('2026-10-12',completeProfile({goal:'muscle',trainingSetup:{...completeProfile().trainingSetup,history:'intermediate'}})),b=getPlan('2026-10-12',completeProfile({goal:'muscle'}));
 assert.ok(b.exercises.reduce((s,e)=>s+e.sets,0)<a.exercises.reduce((s,e)=>s+e.sets,0));assert.ok(b.exercises.every(e=>e.sets<=2));
 const saved=createSession(a);assert.deepEqual(getPlan('2026-10-12',{...base,goal:'wellbeing'},{session:saved}),a);
});
test('food portions calculate whole-meal calories and macros; edits recalculate rather than accumulate',()=>{
 assert.equal(estimateMeal([{foodId:'rice',grams:150},{foodId:'chicken',grams:120}]).calories,393);
 assert.equal(estimateMeal([{foodId:'rice',grams:200},{foodId:'chicken',grams:120}]).calories,458);
 assert.deepEqual(estimateMeal([]),{calories:0,protein:0,carbs:0,fats:0});
 assert.equal(searchFoods('米饭')[0].id,'rice');assert.equal(searchFoods('not a food').length,0);
 for(const grams of [0,-1,NaN,3001])assert.throws(()=>estimateMeal([{foodId:'rice',grams}]));assert.throws(()=>estimateMeal([{foodId:'unknown',grams:100}]));
});
