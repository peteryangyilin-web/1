import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateWeek,getPersonalizedPlan,getTrainingContext,screenHealth,EXERCISE_CATALOG,weekStart,moderateEquivalentMinutes} from '../src/trainingPlanner.js';
import {getPlan,createSession} from '../src/model.js';
import {getExerciseDemo} from '../src/exerciseDemos.js';
import {completeProfile} from './fixtures/training-profile.js';
const date='2026-11-09';
const make=(fields={},setup={})=>{const p=completeProfile(fields);return {...p,trainingSetup:{...p.trainingSetup,...setup}}};
const week=(p,records={})=>generateWeek(p,records,date);
test('the uploaded beginner example yields 2 strength days, 60 aerobic and 150 calendar minutes, with actual rest days',()=>{
 const w=week(completeProfile());assert.equal(w.status,'ready');assert.equal(w.weekly.strengthDays,2);assert.equal(w.weekly.moderateMinutes,60);assert.equal(w.weekly.totalMinutes,150);
 for(const i of [2,4,6])assert.deepEqual([w.calendar[i].duration,w.calendar[i].exercises.length],[0,0]);
 assert.match(w.weekly.gap,/90 aerobic minutes below/);assert.equal(w.weekly.secondarySetsCounted,false);assert.equal(moderateEquivalentMinutes(30,10),50);
 assert.ok(w.calendar[0].exercises.filter(e=>e.kind==='strength').every(e=>e.sets===2&&e.rir===3&&e.weight===null&&e.restSeconds>=90));
 assert.equal(w.weekly.muscleSets.biceps,undefined,'Secondary biceps stimulus is not inflated to full direct sets');
});
test('required fields are real answers, not guessed from old defaults or an eligible checkbox',()=>{
 const c=getTrainingContext({age:30,goal:'muscle',experience:'beginner',days:4,trainingReadiness:'ready',health_screen:{result:'eligible_general_plan'}});
 assert.equal(c.status,'needs_input');assert.ok(c.missing.includes('Available weekdays and minutes (10–120 each, no duplicates)'));assert.equal(week({}).calendar[0].exercises.length,0);
 for(const windows of [[{day:0,minutes:60},{day:0,minutes:60}],[{day:9,minutes:60}],[{day:0,minutes:0}],[{day:0,minutes:25.5}]])assert.equal(week(make({}, {windows})).status,'needs_input');
 assert.equal(week(make({}, {currentActivity:{unknown:true}})).context.currentActivity.unknown,true);
 assert.equal(weekStart('2027-01-01'),'2026-12-28');
});
test('safety takes precedence even if other answers are missing, and unsupported populations get a separate path',()=>{
 assert.equal(screenHealth({warningSymptoms:'yes'}).status,'urgent_review');
 for(const field of ['knownCondition','currentPain','specialCare']){const p=completeProfile();p.trainingSetup.health[field]='yes';assert.equal(week(p).status,'review_required');assert.ok(week(p).calendar.every(d=>d.blocked&&d.exercises.length===0));}
 for(const age of [3,12,17,70])assert.equal(week(completeProfile({age})).status,'specialist_path');
 const p=completeProfile({age:70});p.trainingSetup.health.warningSymptoms='yes';assert.equal(week(p).status,'urgent_review');
 assert.equal(week(completeProfile({goal:'hyrox'})).status,'specialist_path');assert.equal(week(completeProfile({health_screen:{result:'review_required',reviewed_limitations:['clinician restriction']}})).status,'review_required');
});
test('goals, recent training, equipment and real time change the dose without BMI or sex assumptions',()=>{
 const programs=['muscle','fatloss','endurance','wellbeing','strength'].map(goal=>week(make({goal},{history:'intermediate',capacity:40,currentActivity:{moderate_minutes_per_week:100,vigorous_minutes_per_week:0}})));
 assert.equal(programs[0].weekly.strengthDays,4);const changed=make({goal:'muscle'},{goal:'fatloss',history:'intermediate'});assert.equal(week(changed).weekly.strengthDays,4,'A new Overview goal overrides an older setup goal');assert.equal(programs[1].weekly.strengthDays,2);assert.ok(programs[2].weekly.moderateMinutes>programs[1].weekly.moderateMinutes);
 assert.ok(programs[3].weekly.moderateMinutes<programs[2].weekly.moderateMinutes);const seven=week(make({goal:'wellbeing'},{windows:[0,1,2,3,4,5,6].map(day=>({day,minutes:60}))}));assert.ok(seven.calendar.filter(d=>d.type==='Endurance').length<=3,'Seven available days must not force five initial cardio sessions');
 assert.ok(programs[4].calendar.flatMap(d=>d.exercises).filter(e=>e.kind==='strength').every(e=>e.restSeconds===180));
 const male=week(completeProfile({gender:'male',startWeight:60,height:185})),female=week(completeProfile({gender:'female',startWeight:140,height:150}));assert.deepEqual(male.calendar.map(d=>d.exercises),female.calendar.map(d=>d.exercises));assert.equal(getTrainingContext(completeProfile({startWeight:140})).impact,false);
 const db=week(make({goal:'muscle'},{history:'advanced',equipment:'dumbbells'}));assert.ok(db.calendar.flatMap(d=>d.exercises).every(e=>!/bench|incline|pulldown|rope/i.test(e.name)));
 assert.equal(week(make({}, {equipment:'bodyweight'})).status,'needs_equipment_alternative');
 const unfamiliar=week(make({}, {technique:'needs_instruction'}));assert.equal(unfamiliar.status,'constraint_gap');assert.ok(unfamiliar.weekly.missingPatterns.includes('hip'));
});
test('matrix: time caps include rests, catalog matches available equipment, missing coverage is disclosed, no rest-day filler',()=>{
 for(const goal of ['muscle','fatloss','endurance','wellbeing','strength'])for(const history of ['beginner','returning','intermediate','advanced'])for(const minutes of [10,20,30,45,60,90])for(const equipment of ['gym','dumbbells'])for(const days of [1,2,3,4,5,6,7]){
  const windows=[0,1,2,3,4,5,6].slice(0,days).map(day=>({day,minutes})),p=make({goal},{windows,history,equipment}),w=week(p);
  for(let i=0;i<7;i++){const d=w.calendar[i];assert.ok(d.duration<= (windows.find(x=>x.day===i)?.minutes||0));if(!windows.some(x=>x.day===i))assert.equal(d.exercises.length,0);assert.ok(Number.isFinite(d.duration));for(const e of d.exercises){assert.ok(getExerciseDemo(e.name),e.name);assert.ok(e.sets>=1);if(e.kind==='strength')assert.ok(e.restSeconds>=90);}}
  if(w.weekly.missingPatterns.length)assert.equal(w.status,'constraint_gap');
 }
 for(const e of EXERCISE_CATALOG){assert.ok(getExerciseDemo(e.name));assert.ok(e.version&&e.reviewStatus&&e.sourceIds.length&&e.mediaLicense);}
});
function logged(p,d,feedback,weight=20){const s=createSession(getPersonalizedPlan(d,p));s.completedAt=d+'T18:00:00Z';s.feedback=feedback;s.plan.exercises.forEach((e,i)=>s.sets[i].forEach(v=>{v.done=true;v.reps=e.repMax||e.minutes;v.weight=e.kind==='strength'?weight:0}));return {session:s};}
const good={technique:'stable',rir:'3',recovery:'normal',fatigue:'normal',pain:'no',warningSymptoms:'no',cardio:'easy',barrier:'none'};
test('progression requires two real qualifying sessions, never fills an initial load, and does not edit history',()=>{
 const p=completeProfile(),a=logged(p,'2026-11-02',good),b=logged(p,'2026-11-05',good),records={'2026-11-02':a,'2026-11-05':b},copy=structuredClone(records);
 const next=week(p,records);const squat=next.calendar.flatMap(d=>d.exercises).find(e=>e.exerciseId==='squat');assert.deepEqual(squat.suggestedLoadRange,[20.4,21]);assert.equal(squat.weight,20);assert.match(squat.loadAdvice,/smallest available/);assert.deepEqual(records,copy);
 const one=week(p,{'2026-11-02':a});assert.ok(one.calendar.flatMap(d=>d.exercises).every(e=>!e.suggestedLoadRange));
 const missing=structuredClone(records);missing['2026-11-05'].session.feedback=null;assert.ok(week(p,missing).calendar.flatMap(d=>d.exercises).every(e=>!e.suggestedLoadRange));
 assert.deepEqual(getPlan('2026-11-02',{...p,goal:'wellbeing'},{session:a.session},records),a.session.plan);
 assert.equal(createSession(getPersonalizedPlan(date,p)).sets[0][0].weight,null);
});
test('two poor sessions deload; low adherence asks the barrier, time constraints shorten instead of changing all loads',()=>{
 const p=make({}, {history:'intermediate'}),bad={...good,recovery:'poor',fatigue:'high'};
 const records={'2026-11-02':logged(p,'2026-11-02',bad),'2026-11-05':logged(p,'2026-11-05',bad)};
 assert.equal(week(p,records).feedback.deload,true);const total=w=>w.calendar.flatMap(d=>d.exercises).filter(e=>e.kind==='strength').reduce((s,e)=>s+e.sets,0);const ratio=total(week(p,records))/total(week(p));assert.ok(ratio>=.6&&ratio<=.75,`Deload ratio ${ratio}`);
 const short={'2026-11-02':logged(p,'2026-11-02',{...good,barrier:'time'})};assert.equal(week(p,short).feedback.shortened,true);assert.ok(week(p,short).calendar.every(d=>d.duration<=30));
 const single={'2026-11-02':logged(p,'2026-11-02',bad)};assert.equal(week(p,single).feedback.deload,false);
});
test('cardio increases at most one session by five minutes; no feedback preserves the last compatible dose; new pain pauses training',()=>{
 const p=completeProfile(),rec={'2026-11-03':logged(p,'2026-11-03',good)};const next=week(p,rec),normal=week(p);assert.ok(next.weekly.moderateMinutes-normal.weekly.moderateMinutes<=5);assert.ok(next.calendar.filter(d=>d.progressionApplied).length<=1);
 const old=logged(p,'2026-11-03',null);old.session.plan.duration+=5;old.session.plan.cardioMinutes+=5;old.session.plan.exercises[0].minutes+=5;const preserved=week(p,{'2026-11-03':old});assert.equal(preserved.calendar[1].cardioMinutes,old.session.plan.cardioMinutes);
 const pain=logged(p,'2026-11-05',{...good,pain:'yes'});assert.equal(week(p,{'2026-11-05':pain}).status,'review_required');
 const warning=logged(p,'2026-11-05',{...good,warningSymptoms:'yes'});assert.equal(week(p,{'2026-11-05':warning}).status,'urgent_review');assert.equal(getPersonalizedPlan('2026-11-02',p,{'2026-11-05':warning}).status,'urgent_review','Switching to a past training date cannot bypass a current warning');
});
