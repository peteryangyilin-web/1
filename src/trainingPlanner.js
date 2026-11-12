// Deterministic product rules from docs/fitness-weekly-algorithm.cn.md.
// Templates are implemented product rules, not clinically validated prescriptions.
export const PLANNER_VERSION = 4;
export const TEMPLATE_VERSION = 'GO-2026-11-12.1';
export const TRAINING_SOURCES = [
 {id:'S01',label:'WHO · Physical activity guidelines (2020)',url:'https://www.who.int/publications/i/item/9789240015128/'},
 {id:'S02',label:'HHS · Physical Activity Guidelines, 2nd edition',url:'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines'},
 {id:'S03',label:'ACSM · Resistance training (2026, supplied reference)',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/'},
 {id:'S04',label:'Exercise is Medicine · Preparticipation screening',url:'https://www.exerciseismedicine.org/wp-content/uploads/2021/02/EIM-Health-Care-Providers-Action-Guide-clickable-links.pdf'},
 {id:'S05',label:'ACE · Exercise library (reference only)',url:'https://www.acefitness.org/resources/everyone/exercise-library/'},
 {id:'S09',label:'NSCA · Older adults',url:'https://www.nsca.com/about-us/position-statements/resistance-training-for-older-adults/'},
 {id:'S10',label:'NSCA · Youth resistance training',url:'https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf'},
 {id:'S11',label:'ACOG · Exercise during pregnancy',url:'https://www.acog.org/womens-health/faqs/exercise-during-pregnancy'},
 {id:'S07',label:'NHS · Couch to 5K',url:'https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/'},
 {id:'S12',label:'CDC · Measuring activity intensity',url:'https://www.cdc.gov/physical-activity-basics/measuring/index.html'},
];
export const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const GOAL_LABELS = {muscle:'Build muscle',fatloss:'Lose fat',endurance:'Improve endurance',wellbeing:'Feel healthier',strength:'Build strength',hyrox:'HYROX'};
const aliases={hypertrophy:'muscle',fat_loss:'fatloss',general_health:'wellbeing'};
const number=(v,min,max)=>v!==null&&v!==''&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max?Number(v):null;
const round=n=>Math.round(n*10)/10;
export const moderateEquivalentMinutes=(moderate,vigorous=0)=>moderate+2*vigorous;
export function weekStart(date){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)}
const plusDay=(date,i)=>{const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)};
export function screenHealth(answers={}){
 const keys=['warningSymptoms','knownCondition','currentPain','specialCare'];
 if(answers.warningSymptoms==='yes')return {status:'urgent_review',reasons:['Pause training. Current chest pain, fainting or unusual breathlessness needs prompt medical assessment. If severe or persistent, seek emergency care.']};
 if(keys.some(k=>answers[k]==='yes'||answers[k]==='unsure'))return {status:'review_required',reasons:['Your symptoms, condition, pain or specialist needs require individual assessment before a general plan. This does not mean you cannot exercise.']};
 if(keys.some(k=>!['no','yes','unsure'].includes(answers[k])))return {status:'needs_input',reasons:['Complete the short health questions before a general training plan is generated.']};
 return {status:'ready',reasons:[]};
}
export function getTrainingContext(profile={},records={},date=new Date().toISOString().slice(0,10)){
 const s=profile.trainingSetup||{},age=number(profile.age,1,110),rawGoal=profile.goal||profile.primary_goal||s.goal,goal=aliases[rawGoal]||rawGoal;
 const history=s.history||profile.training_history,technique=s.technique||profile.technique_familiarity;
 const rawWindows=s.windows||profile.available_windows,windows=[];let invalidWindows=false;
 if(Array.isArray(rawWindows))for(const w of rawWindows){const index=typeof w.day==='number'?w.day:WEEKDAYS.indexOf(w.day),minutes=number(w.minutes,10,120);if(!Number.isInteger(minutes)||!Number.isInteger(index)||index<0||index>6||minutes===null||windows.some(x=>x.day===index))invalidWindows=true;else windows.push({day:index,minutes})}
 windows.sort((a,b)=>a.day-b.day);
 const rawEquipment=s.equipment||profile.equipment,equipment=Array.isArray(rawEquipment)?rawEquipment:rawEquipment?[rawEquipment]:[];
 const activity=s.currentActivity||profile.current_activity;
 const moderate=number(activity?.moderate_minutes_per_week,0,3000),vigorous=number(activity?.vigorous_minutes_per_week,0,1500);
 const capacity=number(s.capacity??profile.cardioCapacity,5,60);
 const health=screenHealth(s.health||profile.healthAnswers);
 const missing=[];
 if(age===null)missing.push('Age');if(!GOAL_LABELS[goal])missing.push('Training goal');
 if(!['beginner','returning','intermediate','advanced'].includes(history))missing.push('Recent training history');
 if(!['needs_instruction','familiar'].includes(technique))missing.push('Movement familiarity');
 if(!windows.length||invalidWindows)missing.push('Available weekdays and minutes (10–120 each, no duplicates)');
 if(!equipment.length||equipment.some(e=>!['gym','dumbbells','bodyweight','bands','gym_machines','treadmill'].includes(e)))missing.push('Available equipment');
 if(!activity||(activity.unknown!==true&&(moderate===null||vigorous===null)))missing.push('Current aerobic activity (or Not sure)');
 if(capacity===null)missing.push('Comfortable continuous movement');
 if(health.status==='needs_input')missing.push('Health questions');
 let status=health.status==='ready'?(missing.length?'needs_input':'ready'):health.status;
 let reasons=[...health.reasons];
 if(age!==null&&age<18){status='specialist_path';reasons=['GO’s adult gym engine does not prescribe for under-18s. Use varied age-appropriate activity and qualified supervision. Ages 5–17: aim for an average 60 minutes/day of varied activity; under-5s need early-years activity resources.'];}
 if(age>=65){status='specialist_path';reasons=['Age alone does not reduce strength ability. GO has not yet implemented a reviewed older-adult multicomponent template, including balance and functional strength on 3+ days. Discuss a plan based on your actual abilities with a qualified coach.'];}
 if(goal==='hyrox'&&status==='ready'){status='specialist_path';reasons=['GO has no reviewed HYROX-specific module yet. Build a general fitness base with a coach before competition simulations.'];}
 if(health.status==='urgent_review'){status=health.status;reasons=health.reasons;}
 if(status!=='urgent_review'&&(profile.trainingReadiness==='individual'||['review_required','specialist_path'].includes(profile.health_screen?.result)||profile.health_screen?.reviewed_limitations?.length||['pregnant','postpartum'].includes(profile.pregnancy_or_postpartum))){status='review_required';reasons=['A previously reported or reviewed restriction needs individual exercise guidance. GO has no specialist template for these needs; seek appropriate professional advice.'];}
 if(health.status==='review_required'){status=health.status;reasons=health.reasons;}
 if(profile.health_screen?.result==='urgent_review'){status='urgent_review';reasons=['An existing health review flags urgent symptoms. Pause training and seek prompt assessment; severe or persistent symptoms need emergency care.'];}
 const recentFeedback=Object.entries(records).filter(([d,r])=>d<=new Date().toISOString().slice(0,10)&&r.session?.feedback&&r.session?.completedAt).sort(([a],[b])=>b.localeCompare(a))[0]?.[1].session;
 if(recentFeedback&&(!s.updatedAt||recentFeedback.completedAt>s.updatedAt)){
  if(recentFeedback.feedback.warningSymptoms==='yes'){status='urgent_review';reasons=screenHealth({warningSymptoms:'yes',knownCondition:'no',currentPain:'no',specialCare:'no'}).reasons;}
  else if(recentFeedback.feedback.pain==='yes'&&status!=='urgent_review'){status='review_required';reasons=['New pain was reported after training. Stop the affected activity and seek assessment before continuing a general plan.'];}
 }
 const experienced=['intermediate','advanced'].includes(history)&&technique==='familiar';
 return {age,goal,days:windows.length,windows,equipment,history,experience:experienced?history:'beginner',technique,introductory:!experienced,capacity:capacity??5,currentActivity:{moderate:moderate??0,vigorous:vigorous??0,unknown:activity?.unknown===true},impact:s.lowImpact===true||profile.jointPreference==='low-impact',cardio:s.cardio||'walking',status,blocked:status!=='ready',missing,reasons,assumptions:[],budget:Math.max(0,...windows.map(w=>w.minutes)),weight:number(profile.currentWeight??profile.startWeight??profile.weight_kg,20,500),height:number(profile.height??profile.height_cm,100,250),older:age>=65,youth:age!==null&&age<18};
}
// All entries resolve to existing GO-owned demonstrations. No external media is copied.
const rows=[
 ['squat','Goblet squat','knee',['quads','glutes'],['core'],['dumbbells'],false],
 ['hinge','Romanian deadlift','hip',['hamstrings','glutes'],['back'],['dumbbells'],false],
 ['push','Push-up','horizontal_push',['chest'],['triceps','shoulders'],[],false],
 ['row','Dumbbell row','horizontal_pull',['back'],['biceps'],['dumbbells'],true],
 ['press','Seated shoulder press','vertical_push',['shoulders'],['triceps'],['dumbbells','seat'],false],
 ['pulldown','Lat pulldown','vertical_pull',['back'],['biceps'],['pulldown'],false],
 ['lunge','Reverse lunge','knee',['quads','glutes'],[],[],true],
 ['calf','Calf raise','calf',['calves'],[],[],false],
 ['core','Dead bug','core',['core'],[],[],true],
 ['bench','Barbell bench press','horizontal_push',['chest'],['triceps','shoulders'],['barbell','bench'],false],
 ['incline','Incline dumbbell press','horizontal_push',['chest'],['triceps'],['dumbbells','bench'],false],
 ['lateral','Lateral raises','shoulder',['shoulders'],[],['dumbbells'],false],
 ['curl','Dumbbell curl','arm',['biceps'],[],['dumbbells'],false],
 ['triceps','Triceps rope pushdown','arm',['triceps'],[],['cable'],false],
];
export const EXERCISE_CATALOG=rows.map(([id,name,pattern,primaryMuscles,secondaryMuscles,equipment,unilateral])=>({id,name,pattern,primaryMuscles,secondaryMuscles,equipment,unilateral,skill:['bench','incline','hinge'].includes(id)?'familiar':'introductory',version:TEMPLATE_VERSION,mediaLicense:'GO bundled original animation',reviewStatus:'product-template; professional review pending',sourceIds:['S03','S05'],alternatives:pattern==='horizontal_push'?['push','bench','incline']:pattern==='knee'?['squat','lunge']:pattern==='horizontal_pull'?['row']:[],cues:'Controlled, pain-free repetitions. Stop before technique changes.'}));
const templates={
 fullA:['squat','push','row','hinge','calf','core'],fullB:['hinge','push','row','squat','press','core'],
 upperA:['bench','row','press','pulldown','curl'],upperB:['incline','row','lateral','push','triceps'],
 lowerA:['squat','hinge','lunge','calf','core'],lowerB:['hinge','squat','calf','core','lunge'],
};
function availableItems(c){const kit=new Set(c.equipment.includes('gym')?['dumbbells','seat','barbell','bench','pulldown','cable']:c.equipment.includes('dumbbells')?['dumbbells','seat']:[]);return EXERCISE_CATALOG.filter(e=>e.equipment.every(k=>kit.has(k))&&(c.technique==='familiar'||e.skill==='introductory')&&(!c.impact||e.id!=='lunge'));}
function fitExercises(key,c,budget,deload=false){
 const candidates=availableItems(c);let ids=templates[key];
 ids=ids.map(id=>id==='bench'&&!candidates.some(e=>e.id===id)?'push':id==='incline'&&!candidates.some(e=>e.id===id)?'push':id==='pulldown'&&!candidates.some(e=>e.id===id)?'row':id==='hinge'&&c.technique==='needs_instruction'?'squat':id);
 const selected=[...new Set(ids)].map(id=>candidates.find(e=>e.id===id)).filter(Boolean);
 const sets=c.introductory||c.goal==='wellbeing'?2:c.history==='advanced'&&c.goal==='muscle'?4:3;
 const rest=c.goal==='strength'&&!c.introductory?180:120;
 let exercises=selected.map(e=>({...e,exerciseId:e.id,kind:'strength',sets,reps:8,repMin:e.id==='core'?6:e.id==='calf'?10:c.goal==='strength'&&!c.introductory?6:8,repMax:e.id==='core'?10:e.id==='calf'?15:c.goal==='strength'&&!c.introductory?8:12,restSeconds:rest,rir:3,weight:null,effort:'Finish with about 3 good repetitions in reserve (RIR 3).',note:e.id==='push'&&c.introductory?'Use a stable elevated surface if needed; the animation illustrates the floor variation.':e.id==='squat'&&c.technique==='needs_instruction'?'Start with a supported box/sit-to-stand practice and ask for instruction; the demo illustrates the goblet variation.':e.id==='hinge'?'Learn the hip hinge with a light practice load before working sets.':'',calibration:'Choose load through a controlled trial, not from body weight.'}));
 if(deload){const target=Math.ceil(exercises.reduce((s,e)=>s+e.sets,0)*.7);for(let i=exercises.length-1;exercises.reduce((s,e)=>s+e.sets,0)>target;i=(i-1+exercises.length)%exercises.length){if(exercises[i].sets>1)exercises[i].sets--;else if(exercises.every(e=>e.sets===1))break;}}
 const time=()=>8+exercises.reduce((sum,e)=>sum+1.5+e.sets*(e.unilateral?1.2:.75)+(e.sets-1)*e.restSeconds/60,0);
 // Accessories are removed before reducing working sets. Rest intervals are never compressed.
 while(Math.ceil(time())>budget&&exercises.length>3)exercises.pop();
 while(Math.ceil(time())>budget&&exercises.some(e=>e.sets>1))exercises=exercises.map(e=>({...e,sets:Math.max(1,e.sets-1)}));
 while(Math.ceil(time())>budget&&exercises.length)exercises.pop();
 return {exercises:exercises.map(e=>({...e,repRange:`${e.repMin}–${e.repMax}${e.unilateral?' each side':''}`,prescription:`${e.sets} × ${e.repMin}–${e.repMax}${e.unilateral?' / side':''}`})),duration:Math.ceil(time())};
}
function feedbackState(records,start,c){
 const sessions=Object.entries(records).filter(([d,r])=>d<start&&r.session?.completedAt).sort(([a],[b])=>b.localeCompare(a)).map(([date,r])=>({date,...r.session}));
 const last=sessions.slice(0,2),priorStart=plusDay(start,-7);
 const previous=Object.entries(records).filter(([d])=>d>=priorStart&&d<start),completed=previous.filter(([,r])=>r.session?.completedAt).length;
 const barrier=sessions.find(s=>s.date>=priorStart)?.feedback?.barrier??null;
 const adherence=previous.length?completed/Math.max(c.days,previous.filter(([,r])=>r.session).length):null;
 return {sessions,deload:last.length===2&&last.every(s=>s.feedback?.recovery==='poor'||s.feedback?.fatigue==='high'),shorten:adherence!==null&&adherence<.7&&barrier==='time',adherence,barrier};
}
function progressExercise(e,state){
 if(e.kind!=='strength')return e;
 const recent=state.sessions.flatMap(s=>{const i=(s.plan?.exercises||[]).findIndex(x=>(x.exerciseId||x.id)===e.exerciseId);return i<0?[]:[{s,sets:s.sets?.[i],old:s.plan.exercises[i]}]}).slice(0,2);
 if(!recent.length)return {...e,loadAdvice:e.calibration};
 const latest=recent[0],weight=latest.sets?.[0]?.weight;
 const good=x=>x.s.feedback?.technique==='stable'&&Number(x.s.feedback?.rir)>=2&&x.s.feedback?.recovery==='normal'&&x.s.feedback?.pain==='no'&&x.s.feedback?.warningSymptoms==='no'&&x.s.feedback?.fatigue==='normal'&&x.sets?.length>0&&x.sets.length>=x.old.sets&&x.sets.every(v=>v.done&&v.reps>=x.old.repMax&&v.weight===weight);
 if(recent.length===2&&recent.every(good)&&weight>0&&!state.deload){const increment=Math.round(weight*.025*100)/100;return {...e,weight,loadAdvice:`Two qualifying sessions: consider the smallest available increase around 2–5% (${round(weight*1.02)}–${round(weight*1.05)} kg). Keep ${weight} kg if the equipment jump is too large; this is a suggestion, not an automatic load change.`,suggestedLoadRange:[round(weight*1.02),round(weight*1.05)],progressionIncrement:increment};}
 return {...e,weight:weight>0?weight:null,loadAdvice:state.deload?'Two difficult sessions: reduce working sets temporarily; review recovery in one week.':'Maintain the current load. Add repetitions within the range only when technique and recovery are good; missing feedback never triggers progression.'};
}
const timed=(name,time)=>({name:`${name} · ${time} minutes`,exerciseId:name==='Easy walk'?'walk':'cardio',sets:1,reps:time,minutes:time,kind:'time',prescription:`${time} min`,restSeconds:0,intensity:name==='Easy walk'?'easy':'moderate',effort:name==='Easy walk'?'Easy, comfortable movement; not counted as moderate aerobic activity.':'Moderate effort: you can talk but cannot sing. Slow down or pause to keep this effort manageable.'});
function chooseStrengthDays(c){
 const count=Math.min(c.windows.length,c.goal==='muscle'&&!c.introductory?4:c.goal==='muscle'?3:c.goal==='fatloss'&&c.windows.length>=5?3:2);
 let best=[],bestScore=-Infinity;
 // Exhaustively examine at most 128 subsets. Prefer spacing, then longer windows.
 for(let bits=1;bits<(1<<c.windows.length);bits++){
  const days=c.windows.filter((_,i)=>bits&(1<<i));if(days.length!==count)continue;
  let close=0;for(let i=0;i<days.length;i++)for(let j=i+1;j<days.length;j++){const gap=Math.abs(days[i].day-days[j].day);if(Math.min(gap,7-gap)<2)close++}
  const score=days.reduce((s,w)=>s+w.minutes,0)-close*1000;
  if(score>bestScore){bestScore=score;best=days.map(w=>w.day)}
 }
 return best;
}
export function generateWeek(profile={},records={},date=new Date().toISOString().slice(0,10)){
 const c=getTrainingContext(profile,records,date),start=weekStart(date),state=feedbackState(records,start,c),common={plannerVersion:PLANNER_VERSION,templateVersion:TEMPLATE_VERSION,goalId:c.goal,goalLabel:GOAL_LABELS[c.goal]||'Training',sourceIds:['S01','S02','S03','S04','S05','S12'],method:'Deterministic GO product rules from the supplied algorithm; professional template review is pending.',loading:'Use a light load chosen through trial. No 1RM test or body-size-based load. Stop for pain or warning symptoms.',progression:'No feedback: maintain. Two qualifying sessions: consider a small load increase. Two difficult sessions: temporarily reduce working sets. Adjust one aerobic session by 5 minutes only if tolerated and within its window.',profileReasons:c.reasons,assumptions:[]};
 const blank=(index,extra={})=>({...common,date:plusDay(start,index),title:'Rest day',type:'Recovery',focus:'No scheduled training',duration:0,exercises:[],cardioMinutes:0,strengthDay:false,blocked:false,...extra});
 if(!c.blocked&&!availableItems(c).some(e=>e.pattern==='horizontal_pull')){c.status='needs_equipment_alternative';c.blocked=true;c.reasons=['Your available equipment has no supported pulling exercise in GO’s current filmed catalog. Choose suitable dumbbells or gym access, or ask a coach for an appropriate alternative. GO will not invent a replacement.'];}
 if(c.blocked){const titles={needs_input:'Complete your training setup',urgent_review:'Pause training',review_required:'Individual assessment needed',specialist_path:'Specialist pathway',needs_equipment_alternative:'Equipment alternative needed'};return {status:c.status,missing:c.missing,reasons:c.reasons,calendar:WEEKDAYS.map((_,i)=>blank(i,{title:titles[c.status],type:'Guidance',blocked:true,status:c.status,rationale:c.reasons.join(' ')||'Your age, experience, available time and health questions are needed before personalizing a plan.'})),context:c};}
 let strengthDays=chooseStrengthDays(c);
 if(c.introductory)strengthDays=strengthDays.filter((d,i,ds)=>!ds.slice(0,i).some(p=>Math.min(Math.abs(d-p),7-Math.abs(d-p))<2));
 const signature=JSON.stringify({goal:c.goal,windows:c.windows,equipment:c.equipment,history:c.history,technique:c.technique,capacity:c.capacity,activity:c.currentActivity,impact:c.impact});
 const split=c.goal==='muscle'&&!c.introductory&&strengthDays.length===4;
 const cardioDays=c.windows.filter(w=>!strengthDays.includes(w.day)).slice(0,3).map(w=>w.day);
 let si=0,cardioExtended=false;
 const calendar=WEEKDAYS.map((_,index)=>{
  const window=c.windows.find(w=>w.day===index);if(!window||(!strengthDays.includes(index)&&!cardioDays.includes(index)))return blank(index);
  const budget=state.shorten?Math.min(window.minutes,30):window.minutes;
  let key=strengthDays.includes(index)?split?['upperA','lowerA','upperB','lowerB'][si++]:si++%2?'fullB':'fullA':'cardio';
  const result=blank(index,{status:'ready',windowMinutes:window.minutes,availableMinutes:budget,templateId:`${c.goal}-${key}`,rationale:'A starting dose based on your actual available window, equipment, recent training and movement familiarity.'});
  if(key==='cardio'){
   const easy=c.goal==='muscle';let increased=false;let main=Math.min(c.capacity,c.currentActivity.unknown?10:c.currentActivity.moderate===0&&c.currentActivity.vigorous===0?20:40,c.goal==='wellbeing'?15:c.goal==='fatloss'?30:40,budget-5);
   const prior=state.sessions.find(s=>s.date>=plusDay(start,-7)&&s.plan?.cardioMinutes>0&&s.feedback?.cardio==='easy'&&s.feedback?.recovery==='normal'&&s.feedback?.pain==='no'&&s.feedback?.warningSymptoms==='no');
   if(prior&&!cardioExtended&&!easy&&!state.deload){const before=main;main=Math.min(main+5,budget-5,Math.max(5,prior.plan.cardioMinutes+5));increased=main>before;cardioExtended=increased;}
   if(main<5)return {...result,title:'Rest · window too short',constraintGap:'This window cannot fit a 5-minute activity plus warm-up and cool-down.'};
   return {...result,title:easy?'Easy movement':'Build your aerobic base',type:easy?'Movement':'Endurance',duration:main+5,exercises:[timed(easy?'Easy walk':'Steady cardio',main)],warmup:'3 minutes gradually warming up.',cooldown:'2 minutes gradually slowing down.',cardioMinutes:easy?0:main,effort:easy?'Easy, comfortable movement.':'Moderate: you can talk but cannot sing. Slow down or pause as needed.',focus:c.cardio==='run-walk'?'Run/walk only within your comfortable tolerance; walking is always an option.':'Walking at a controlled, conversational pace.',progressionApplied:increased};
  }
  const fit=fitExercises(key,c,budget,state.deload);
  if(fit.exercises.length<2)return {...result,title:'Lower-dose option needed',constraintGap:'There is not enough time for a useful resistance block with necessary rests. Choose a longer window; no hidden exercise is added to rest days.'};
  let exercises=fit.exercises.map(e=>progressExercise(e,state));const spare=budget-(state.deload?fitExercises(key,c,budget,false).duration:fit.duration);
  const cardioMinutes=['fatloss','endurance','wellbeing'].includes(c.goal)&&spare>=5?Math.min(10,c.capacity,spare):0;
  if(cardioMinutes)exercises.push(timed('Steady cardio',cardioMinutes));
  return {...result,title:split?(key.startsWith('upper')?'Upper-body strength':'Lower-body strength'):c.goal==='fatloss'?'Strength & steady habits':c.goal==='strength'?'Strength foundations':'Full-body strength',type:'Strength',strengthDay:true,duration:fit.duration+cardioMinutes,exercises,cardioMinutes,warmup:'5 minutes easy movement plus light practice sets (1 minute per movement is included in the estimate).',cooldown:'3 minutes easy movement to finish.',focus:c.introductory?'Technique first · about RIR 3':'Controlled progressive strength · about RIR 3',deload:state.deload};
 });
 for(let i=0;i<calendar.length;i++){let p=calendar[i];const previous=state.sessions.find(s=>s.plan?.templateId===p.templateId&&s.plan?.profileSignature===signature);const hasRecentFeedback=state.sessions.some(s=>s.date>=plusDay(start,-7)&&s.feedback);if(previous&&!hasRecentFeedback&&previous.plan.duration<=(p.availableMinutes||0)&&!state.deload){calendar[i]={...p,exercises:structuredClone(previous.plan.exercises),duration:previous.plan.duration,cardioMinutes:previous.plan.cardioMinutes,maintainedFrom:previous.date};}calendar[i].profileSignature=signature;}
 const strength=calendar.flatMap(p=>p.exercises.filter(e=>e.kind==='strength'));
 const coverage=[...new Set(strength.map(e=>e.pattern))];
 const missingPatterns=['knee','hip','horizontal_push','horizontal_pull','core'].filter(p=>!coverage.includes(p));
 // Never silently invent an unfilmed, unequipped or unfamiliar replacement.
 const status=missingPatterns.length?'constraint_gap':'ready';
 const aerobic=calendar.reduce((s,p)=>s+p.cardioMinutes,0),total=calendar.reduce((s,p)=>s+p.duration,0),strengthCount=calendar.filter(p=>p.strengthDay).length;
 const muscleSets={};for(const e of strength)for(const muscle of e.primaryMuscles)muscleSets[muscle]=(muscleSets[muscle]||0)+e.sets;
 const weekly={adherence:state.adherence,barrier:state.barrier,strengthDays:strengthCount,moderateMinutes:aerobic,vigorousMinutes:0,moderateEquivalentMinutes:moderateEquivalentMinutes(aerobic,0),totalMinutes:total,balanceDays:0,coverage,missingPatterns,muscleSets,secondarySetsCounted:false,reference:'Long-term adult reference: 150–300 moderate-equivalent aerobic minutes/week and major-muscle strengthening on 2+ days.',gap:`This week’s plan: ${aerobic} moderate aerobic minutes, ${strengthCount} strength days and ${total} total scheduled minutes. ${aerobic<150?`${150-aerobic} aerobic minutes below the 150-minute long-term reference; build gradually only within agreed time.`:'The aerobic minimum is met if performed at the prescribed intensity.'}${strengthCount<2?' Fewer than two strength days fit this schedule.':''}${missingPatterns.length?` Coverage gap: ${missingPatterns.map(p=>({knee:'squat / sit-to-stand',hip:'hip hinge / extension',horizontal_push:'pushing',horizontal_pull:'rowing / pulling',core:'core control'})[p]||p).join(', ')}. More time, suitable equipment or coached alternatives are needed.`:''}`};
 for(const p of calendar){p.weekly=weekly;p.audit={withinTime:p.duration<=(p.windowMinutes||0),missingPatterns,templateReview:'pending professional review'};if(status==='constraint_gap')p.constraintGap=weekly.gap;}
 return {status,calendar,weekly,context:c,feedback:{adherence:state.adherence,barrier:state.barrier,deload:state.deload,shortened:state.shorten},templateVersion:TEMPLATE_VERSION};
}
export function getPersonalizedPlan(date,profile={},records={}){
 const week=generateWeek(profile,records,date),index=(new Date(`${date}T12:00:00Z`).getUTCDay()+6)%7;
 return {...week.calendar[index],weekStatus:week.status,missing:week.missing||[],status:week.calendar[index].status||week.status};
}
