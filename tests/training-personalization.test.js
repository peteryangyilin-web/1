import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getPlan,DEFAULT_PROFILE,weekDates,createSession} from '../src/model.js';
import {getExerciseDemo} from '../src/exerciseDemos.js';
import {getTrainingContext} from '../src/trainingPlanner.js';
const monday='2026-10-12',week=weekDates(monday);
const base={...DEFAULT_PROFILE,age:30,height:175,startWeight:75,days:4,equipment:'gym',experience:'intermediate',activity:'moderate',cardioCapacity:20,sessionMinutes:45,trainingReadiness:'ready'};
const plans=p=>week.map(d=>getPlan(d,p));
const workload=p=>plans(p).reduce((t,d)=>t+d.exercises.filter(e=>e.kind==='strength').reduce((s,e)=>s+e.sets,0),0);
test('four goals change actual weekly strength/cardio dose, not just labels',()=>{
 const programs=Object.fromEntries(['muscle','fatloss','endurance','wellbeing'].map(goal=>[goal,plans({...base,goal})]));
 assert.equal(programs.muscle[0].weekly.strengthDays,4);
 assert.equal(programs.fatloss[0].weekly.strengthDays,2);
 assert.equal(programs.endurance[0].weekly.strengthDays,2);
 assert.ok(programs.endurance[0].weekly.moderateMinutes>programs.muscle[0].weekly.moderateMinutes);
 assert.equal(programs.wellbeing[0].weekly.moderateMinutes,0,'Easy walking must not be passed off as moderate intensity');
 const signatures=new Set(Object.values(programs).map(ds=>JSON.stringify(ds.map(d=>d.exercises))));assert.equal(signatures.size,4);
 const three=plans({...base,goal:'muscle',days:3});assert.equal(three[0].title,'Full-body strength');assert.equal(three[0].weekly.strengthDays,3);
 assert.notDeepEqual(three[0].exercises,three[2].exercises,'Whole-body sessions vary movement selection');
});
test('age, current capacity, time, equipment and impact preference change the prescription',()=>{
 assert.ok(workload({...base,age:70})<workload(base));
 const older=plans({...base,age:70});assert.equal(older[0].weekly.balanceDays,3);assert.ok(older[0].exercises.every(e=>e.sets<=2));assert.ok(older.some(p=>p.balance));
 for(const days of [3,4,5,6])assert.ok(getPlan(monday,{...base,days,experience:'beginner'}).weekly.strengthDays<=3,'Novices are not assigned six lifting days');
 assert.ok(getPlan(monday,{...base,age:12}).blocked,'An imported child profile must not receive an adult prescription');
 const youth=getPlan(monday,{...base,age:17});assert.match(youth.progression,/supervision/);assert.match(youth.weekly.reference,/60 minutes/);
 const small=plans({...base,goal:'endurance',cardioCapacity:10});const large=plans({...base,goal:'endurance',cardioCapacity:40});assert.ok(large[0].weekly.moderateMinutes>small[0].weekly.moderateMinutes);
 assert.ok(workload({...base,sessionMinutes:20})<workload({...base,sessionMinutes:60}));
 const dumbbells=plans({...base,equipment:'dumbbells'});assert.notDeepEqual(dumbbells[0].exercises,getPlan(monday,base).exercises);
 assert.ok(dumbbells.every(p=>p.exercises.every(e=>!/barbell|cable|pulldown|incline|rope|face pull/i.test(e.name))));
 const highSize=plans({...base,startWeight:120,height:170,goal:'endurance'});assert.ok(highSize.some(p=>p.exercises.some(e=>e.name.startsWith('Easy walk'))));
 assert.ok(plans({...base,jointPreference:'low-impact'}).every(p=>p.exercises.every(e=>e.name!=='Reverse lunge')));
 assert.equal(getTrainingContext({...base,startWeight:75,currentWeight:120}).impact,true,'Use a logged current weight when provided');
 assert.ok(workload({...base,experience:'beginner'})<workload({...base,experience:'advanced',sessionMinutes:60}));
});
test('sex and cosmetic avatar physique do not invent different strength ability',()=>{
 const male=getPlan(monday,{...base,gender:'male',bodyType:'strong'}),female=getPlan(monday,{...base,gender:'female',bodyType:'lean'});
 assert.deepEqual(male.exercises,female.exercises);assert.equal(male.duration,female.duration);
 assert.match(female.profileReasons.join(' '),/Female/);assert.match(male.profileReasons.join(' '),/Male/);
 assert.match(female.loading,/light load/);assert.ok(!female.exercises.some(e=>e.weight),'Never invent a lifting weight from sex/body mass');
 const restricted=plans({...base,trainingReadiness:'individual'});assert.ok(restricted.every(p=>p.blocked&&p.exercises.length===0));
});
test('every generated starting plan fits its time budget and has a real matching movement demo',()=>{
 for(const goal of ['muscle','fatloss','endurance','wellbeing'])for(const age of [17,30,70,null])for(const days of [3,4,5,6])for(const sessionMinutes of [20,30,45,60])for(const equipment of ['gym','dumbbells'])for(const cardioCapacity of [10,20,40]){
  const p={...base,goal,age,days,sessionMinutes,equipment,cardioCapacity};const ds=plans(p);
  assert.equal(ds.filter(d=>d.type!=='Recovery').length,days);
  for(const d of ds){assert.ok(d.duration<=sessionMinutes,`${JSON.stringify(p)}: ${d.title} ${d.duration} exceeds ${sessionMinutes}`);assert.ok(Number.isFinite(d.duration));for(const e of d.exercises){assert.ok(getExerciseDemo(e.name),`No matching demo ${e.name}`);assert.ok(Number.isInteger(e.sets)&&e.sets>0);assert.ok(e.reps>0);}}
 }
});
test('history remains immutable while unstarted days update and timed work logs minutes',()=>{
 const saved=createSession(getPlan(monday,base));const original=structuredClone(saved.plan);
 assert.deepEqual(getPlan(monday,{...base,age:75,goal:'wellbeing'},{session:saved}),original);
 assert.notDeepEqual(getPlan(monday,{...base,age:75,goal:'wellbeing'}).exercises,original.exercises);
 const cardio=getPlan(monday,{...base,goal:'endurance'}),session=createSession(cardio);
 cardio.exercises.forEach((e,i)=>{if(e.kind==='time')assert.equal(session.sets[i][0].reps,e.minutes)});
 const missing=getPlan(monday,{});assert.match(missing.profileReasons.join(' '),/Age is missing/);assert.ok(missing.assumptions.includes('gym equipment'));
});
