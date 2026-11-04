// General fitness guidance, not a clinical exercise prescription.
// Evidence and the distinction between guidelines and GO heuristics: docs/training-evidence.md.
export const TRAINING_SOURCES = [
  {label:'WHO · Physical activity guidelines',url:'https://www.who.int/news-room/fact-sheets/detail/physical-activity'},
  {label:'HHS · Physical Activity Guidelines, 2nd edition',url:'https://health.gov/sites/default/files/2019-09/Physical_Activity_Guidelines_2nd_edition.pdf'},
  {label:'ACSM · Resistance-training progression (2009)',url:'https://pubmed.ncbi.nlm.nih.gov/19204579/'},
  {label:'ACSM · Exercise prescription (2011)',url:'https://pubmed.ncbi.nlm.nih.gov/21694556/'},
  {label:'Sex differences in resistance-training adaptations · review',url:'https://doi.org/10.1007/s40279-019-01247-x'},
];
export const TRAINING_FIELDS = [
  {name:'sessionMinutes',label:'Time per session',options:[['20','About 20 minutes'],['30','About 30 minutes'],['45','About 45 minutes'],['60','About 60 minutes']],fallback:'45',help:'Includes warm-up, rests and cool-down. A realistic time budget works better than a longer plan you cannot finish.'},
  {name:'equipment',label:'Training equipment',options:[['gym','Gym · machines, bench and free weights'],['dumbbells','Dumbbells · stable seat and floor space']],fallback:'gym',help:'The exercise selection changes with your equipment. Choose Gym only if you have access to the listed equipment. Dumbbell sessions use a stable seat for seated presses; no gym bench or cables are required.'},
  {name:'cardioCapacity',label:'Comfortable continuous movement',options:[['10','Under 15 minutes · starting out'],['20','About 15–30 minutes'],['40','Over 30 minutes']],fallback:'10',help:'How long can you currently walk briskly or do easy cardio while still speaking in sentences? This is a self-report, not a fitness test.'},
  {name:'jointPreference',label:'Movement preference',options:[['standard','No specific impact preference'],['low-impact','Prefer lower impact / extra support']],fallback:'standard',help:'This changes movement choices, not medical clearance. For pain or a movement restriction, select individual guidance below.'},
  {name:'trainingReadiness',label:'Anything requiring an individual plan?',options:[['ready','No known exercise restrictions'],['individual','Pregnant / postpartum, or clinician-advised restrictions']],fallback:'ready',help:'These situations need individual advice before GO can generate a general plan. This short form cannot assess medical readiness.'},
];
const labels={muscle:'Build muscle',fatloss:'Lose fat',endurance:'Improve endurance',wellbeing:'Feel healthier'};
const n=(value,fallback,min,max)=>{const num=Number(value);return value!==null&&value!==''&&Number.isFinite(num)&&num>=min&&num<=max?num:fallback;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function getTrainingContext(profile={}){
  const age=n(profile.age,null,1,100),weight=n(profile.currentWeight??profile.startWeight,null,20,500),height=n(profile.height,null,100,250);
  const bmi=age>=18&&weight&&height?weight/(height/100)**2:null;
  const goal=Object.hasOwn(labels,profile.goal)?profile.goal:'wellbeing';
  const days=[1,2,3,4,5,6,7].includes(Number(profile.days))?Number(profile.days):3;
  const experience=['beginner','intermediate','advanced'].includes(profile.experience)?profile.experience:'beginner';
  const older=age>=65,youth=age!==null&&age<18;
  const capacity=[10,20,40].includes(Number(profile.cardioCapacity))?Number(profile.cardioCapacity):10;
  const impact=profile.jointPreference==='low-impact'||(bmi!==null&&bmi>=30);
  const introductory=experience==='beginner'||older||youth||age===null||(profile.activity==='light'&&capacity===10);
  const activity=['light','moderate','active'].includes(profile.activity)?profile.activity:'moderate';
  const budget=n(profile.sessionMinutes,45,20,60);
  const equipment=profile.equipment==='dumbbells'?'dumbbells':'gym';
  const child=age!==null&&age<16;
  const blocked=child||profile.trainingReadiness==='individual';
  const reasons=[`${labels[goal]} determines the balance of strength, cardio and recovery.`,`${days} sessions/week, with a ${budget}-minute limit; rest days and lighter sessions stay in the schedule.`];
  reasons.push(age===null?'Age is missing: a conservative starting dose is used. Add it to refine your plan.':youth?`${age} years: technique-led sessions, no maximal lifting, and qualified supervision for resistance training.`:older?`${age} years: start with lower volume, longer rests and supported balance practice on at least 3 days.`:`${age} years: adult guidance; experience and reported capacity determine the starting dose.`);
  reasons.push(`${experience} training experience: ${introductory?'lower starting volume and more technique practice':'working sets and exercise complexity reflect your experience'}.`);
  reasons.push(activity==='active'?'Standing and moving often outside training does not prove cardio fitness; protect recovery around physically demanding work.':activity==='light'?'Mostly seated days plus low reported cardio capacity use a smaller starting dose; brief movement breaks can supplement sessions.':'Daily activity provides context, while reported exercise capacity sets the cardio starting dose.');
  reasons.push(`Current comfortable movement: ${capacity===10?'under 15':capacity===20?'15–30':'over 30'} minutes. Cardio begins from this capacity, rather than your goal alone.`);
  if(weight&&height&&age>=18)reasons.push(`${weight} kg / ${height} cm: body size is considered for impact choices${bmi>=30?'; a lower-impact starting option is selected':''}. BMI is a rough screening measure, not body-fat, strength or a diagnosis.`);
  else reasons.push('Body measurements are incomplete: no strength level or body composition is inferred from them.');
  reasons.push(impact?'Lower-impact option: walking-based cardio and supported alternatives; no jumps or mandatory running.':'Cardio uses a conversational pace; running is optional, never required.');
  reasons.push(`${equipment==='gym'?'Gym equipment':'Dumbbells, a stable seat and floor space'} shapes the exercise list. No lifting weight is calculated from body weight or sex.`);
  reasons.push(`${profile.gender==='female'?'Female':profile.gender==='male'?'Male':'Unspecified'} avatar/profile selection is respected. Sex alone does not prescribe different exercises or a weaker/stronger load; effort is individualized. Avatar body type is cosmetic, not a measurement.`);
  const assumptions=[];
  if(!profile.sessionMinutes)assumptions.push('45 minutes per session');
  if(!profile.equipment)assumptions.push('gym equipment');
  if(!profile.cardioCapacity)assumptions.push('under 15 minutes comfortable cardio');
  if(!profile.trainingReadiness)assumptions.push('exercise restrictions not yet reviewed');
  return {age,weight,height,bmi,goal,days,experience,older,youth,capacity,impact,introductory,budget,equipment,blocked,child,reasons,assumptions};
}
const schedules={1:[0],2:[0,3],7:[0,1,2,3,4,5,6],3:[0,2,4],4:[0,2,4,5],5:[0,1,2,4,5],6:[0,1,2,3,4,5]};
const sequences={
 muscle:{1:['fullA'],2:['fullA','fullB'],7:['push','lowerA','pull','pushB','lowerB','pullB','easy'],3:['fullA','fullB','fullC'],4:['upperA','lowerA','upperB','lowerB'],5:['upperA','lowerA','cardio','upperB','lowerB'],6:['push','lowerA','pull','pushB','lowerB','pullB']},
 fatloss:{1:['fullA'],2:['fullA','fullB'],7:['fullA','cardio','fullB','cardio','fullC','cardio','easy'],3:['fullA','cardio','fullB'],4:['fullA','cardio','fullB','cardio'],5:['fullA','cardio','fullB','cardio','fullC'],6:['fullA','cardio','fullB','cardio','fullC','cardio']},
 endurance:{1:['hybrid'],2:['hybrid','hybrid'],7:['cardio','fullA','cardio','fullB','long','easy','easy'],3:['hybrid','fullB','long'],4:['cardio','fullA','long','fullB'],5:['cardio','fullA','cardio','fullB','long'],6:['cardio','fullA','cardio','fullB','long','easy']},
 wellbeing:{1:['fullA'],2:['fullA','fullB'],7:['fullA','easy','fullB','easy','fullC','easy','easy'],3:['fullA','easy','fullB'],4:['fullA','easy','fullB','easy'],5:['fullA','easy','fullB','easy','easy'],6:['fullA','easy','fullB','easy','fullC','easy']},
};
const groups={
 fullA:['Goblet squat','Push-up','Dumbbell row','Dead bug'],
 fullB:['Romanian deadlift','Seated shoulder press','Lat pulldown','Calf raise'],
 fullC:['Reverse lunge','Incline dumbbell press','Seated cable row','Dead bug'],
 upperA:['Barbell bench press','Seated cable row','Seated shoulder press','Lat pulldown'],
 upperB:['Incline dumbbell press','Dumbbell row','Lateral raises','Dumbbell curl','Triceps rope pushdown'],
 lowerA:['Goblet squat','Romanian deadlift','Reverse lunge','Calf raise','Dead bug'],
 lowerB:['Romanian deadlift','Goblet squat','Calf raise','Dead bug'],
 push:['Barbell bench press','Incline dumbbell press','Seated shoulder press','Lateral raises','Triceps rope pushdown'],
 pushB:['Incline dumbbell press','Push-up','Seated shoulder press','Lateral raises'],
 pull:['Lat pulldown','Seated cable row','Face pull','Dumbbell curl'],
 pullB:['Dumbbell row','Lat pulldown','Face pull','Dumbbell curl'],
};
const minutes=(name,time)=>({name:`${name} · ${time} minutes`,sets:1,reps:1,minutes:time,kind:'time',prescription:`${time} min`,restSeconds:0});
const moving=(c,key)=>key==='easy'||c.impact?'Easy walk':'Steady cardio';
function makeDay(index,c){
 const introMuscle={1:['fullA'],2:['fullA','fullB'],7:['fullA','easy','fullB','easy','fullC','easy','easy'],3:['fullA','fullB','fullC'],4:['fullA','fullB','fullC','easy'],5:['fullA','easy','fullB','fullC','easy'],6:['fullA','easy','fullB','easy','fullC','easy']};
 const sequence=c.goal==='muscle'&&c.introductory?introMuscle[c.days]:sequences[c.goal][c.days];
 const slot=schedules[c.days].indexOf(index),key=slot<0?'recovery':sequence[slot];
 const common={plannerVersion:3,goalId:c.goal,goalLabel:labels[c.goal],profileReasons:c.reasons,assumptions:c.assumptions,blocked:c.blocked};
 if(c.blocked)return {...common,title:'Your individual starting point',type:'Guidance',duration:0,focus:'Review your exercise needs with a qualified professional',exercises:[],rationale:c.child?'GO training plans currently support ages 16 and up. Younger users need age-appropriate activity and individual supervision, rather than an adult gym prescription.':'Pregnancy, postpartum recovery or exercise restrictions need an individual plan. GO has paused automatic training prescriptions.',cardioMinutes:0,strengthDay:false};
 const balance=c.older&&[0,2,4].includes(index)?{minutes:5,instruction:'Near a stable counter, practice a supported single-leg stand, alternating sides for 10–20 seconds. Keep a hand on the support and stop if unsteady. Ask for help if you have a history of falls.'}:null;
 if(key==='recovery')return {...common,title:'Active recovery',type:'Recovery',duration:20,focus:'Easy movement · Recovery',exercises:[minutes('Easy walk',balance?5:10),minutes('Hip mobility',5),minutes('Shoulder mobility',5)],rationale:'An easy, optional recovery day. No hard lifting; easy walking is not automatically counted toward moderate-intensity activity.',balance,cardioMinutes:0,strengthDay:false};
 const cardio=['cardio','long','easy','hybrid'].includes(key);
 const lowVolume=c.introductory||c.goal==='wellbeing';
 const sets=lowVolume?2:c.experience==='advanced'&&c.goal==='muscle'?4:3;
 const reps=c.goal==='muscle'&&!lowVolume?6:8;
 const restSeconds=lowVolume?120:c.goal==='muscle'?120:90;
 const effort=c.youth||c.older?'Easy to moderate · stop with at least 3 comfortable reps left':'Moderate · finish with 2–3 reps left in reserve';
 const target=c.goal==='muscle'&&!lowVolume?'6–12':lowVolume?'8–12':'8–15';
 const maxCardio=c.capacity===10?10:c.capacity===20?20:35;
 if(cardio){
  const hybrid=key==='hybrid';
  const strength=hybrid&&c.budget>=(balance?35:30)?['Goblet squat','Dumbbell row','Push-up'].map(name=>({name,sets:2,reps:8,kind:'strength',restSeconds:120,repRange:'8–12',effort,prescription:'2 × 8–12'})):[];
  const strengthTime=strength.reduce((t,e)=>t+e.sets*1+(e.sets-1)*2+1,0);
  const planned=key==='easy'?Math.min(maxCardio,20):key==='long'?maxCardio+(c.capacity===40?5:0):maxCardio;
  const main=Math.max(5,Math.min(planned,c.budget-10-strengthTime-(balance?5:0)));
  const warm=5,cool=5;
  return {...common,title:key==='easy'?'Easy movement':key==='hybrid'?(strength.length?'Aerobic base & strength':'Aerobic base'):key==='long'?'Build your aerobic base':'Steady movement',type:key==='easy'?'Movement':'Endurance',focus:c.impact?'Lower impact · Comfortable, controlled pace':'Conversational pace · Aerobic foundation',duration:warm+main+cool+strengthTime+(balance?5:0),exercises:[minutes('Easy warm-up',warm),minutes(moving(c,key),main),...strength,minutes('Cool-down',cool)],rationale:`${labels[c.goal]} · ${main} minutes of ${key==='easy'?'easy movement':'conversational cardio'}, based on current capacity and available time.${strength.length?' A short whole-body strength block supports your endurance.':''}`,cardioMinutes:key==='easy'?0:main,strengthDay:strength.length>0,balance,effort:'Moderate cardio: you can talk in sentences but not sing. Slow down or take breaks to maintain control; easy days stay easier.'};
 }
 let names=groups[key]||groups.fullA;
 if(c.introductory&&key.startsWith('upper'))names=key==='upperA'?['Push-up','Dumbbell row','Seated shoulder press']:['Incline dumbbell press','Lat pulldown','Lateral raises'];
 if(c.introductory)names=names.map(name=>name==='Barbell bench press'?'Push-up':name);
 if(c.impact||c.older)names=names.map(name=>name==='Reverse lunge'?'Calf raise':name);
 if(c.equipment==='dumbbells')names=names.map(name=>({'Barbell bench press':'Push-up','Incline dumbbell press':'Push-up','Lat pulldown':'Dumbbell row','Seated cable row':'Dumbbell row','Face pull':'Lateral raises','Triceps rope pushdown':'Push-up'}[name]||name));
 names=[...new Set(names)];
 const perExercise=sets*.75+(sets-1)*restSeconds/60+1;
 const fittedCount=clamp(Math.floor((c.budget-10-(balance?5:0))/perExercise),2,names.length);
 const count=key.startsWith('full')&&!balance?Math.max(Math.min(3,names.length),fittedCount):fittedCount;
 let exercises=names.slice(0,count).map(name=>({name,sets,reps,kind:'strength',restSeconds,repRange:target,effort,prescription:`${sets} × ${target}`,note:name==='Push-up'&&lowVolume?'Use a stable elevated surface if floor repetitions are too hard. The animation shows the floor variation; choose the version you control.':name==='Calf raise'&&(c.older||c.impact)?'Use a stable support for balance.':''}));
 // Keep a short session feasible: reduce sets before exceeding the available time.
 let work=()=>exercises.reduce((t,e)=>t+e.sets*.75+(e.sets-1)*e.restSeconds/60+1,0);
 while(work()+10+(balance?5:0)>c.budget&&exercises.some(e=>e.sets>1)){exercises=exercises.map(e=>e.sets>1?{...e,sets:e.sets-1,prescription:`${e.sets-1} × ${e.repRange}`}:e);}
 const title=key.startsWith('upper')?'Upper-body strength':key.startsWith('lower')?'Lower-body strength':key.startsWith('push')?'Push strength':key.startsWith('pull')?'Pull strength':c.goal==='fatloss'?'Strength & steady habits':c.goal==='wellbeing'?'Everyday strength':c.goal==='endurance'?'Strength for endurance':'Full-body strength';
 return {...common,title,type:c.goal==='wellbeing'?'Movement':'Strength',focus:`${key.startsWith('full')?'Whole-body training':'Controlled strength'} · ${lowVolume?'Technique first':'Progressive effort'}`,duration:Math.ceil(work()+10+(balance?5:0)),warmup:'5 min easy movement and light practice repetitions. Warm-up sets are not working sets.',cooldown:'5 min easy movement to finish. The session time includes both warm-up and cool-down.',exercises,rationale:`${labels[c.goal]} · ${key.startsWith('full')?'Whole-body sessions distribute major movement patterns across the week.':'A split distributes training stress across the week.'} ${lowVolume?'A lower starting dose leaves room for technique and recovery.':'Working sets use an individual effort target, not a body-weight-based load.'}`,effort,cardioMinutes:0,strengthDay:true,balance};
}
export function getPersonalizedPlan(date,profile={}){
 const c=getTrainingContext(profile),index=(new Date(`${date}T12:00:00`).getDay()+6)%7;
 const plan=makeDay(index,c);
 const week=Array.from({length:7},(_,i)=>makeDay(i,c));
 const cardio=week.reduce((s,p)=>s+p.cardioMinutes,0),strength=week.filter(p=>p.strengthDay).length;
 return {...plan,weekly:{strengthDays:strength,moderateMinutes:cardio,balanceDays:week.filter(p=>p.balance).length,reference:c.youth?'Youth guidance: work toward 60 minutes of varied activity daily, including muscle/bone strengthening on 3 days; these sessions are only part of that activity.':'Adult reference: 150–300 min moderate activity/week and strength for major muscle groups on 2+ days. Start below this if needed and build gradually.',gap:c.youth?'Include enjoyable daily movement and supervised, age-appropriate exercise beyond these sessions.':cardio<150?`This starting plan includes ${cardio} planned moderate minutes. It does not yet meet the 150-minute reference; gradually add suitable brisk movement outside sessions.${strength<2?' Your schedule also includes fewer than 2 strength days: consider a longer hybrid session or another suitable strength day if available.':''}`:'The planned moderate minutes meet the minimum adult aerobic reference if performed at moderate intensity.'},progression:c.youth?'Technique first, with qualified supervision; avoid maximal lifts and review the plan with a coach.':'First build consistency for 1–2 weeks. When every set reaches the top of its rep range with 2–3 reps still possible in two consecutive sessions, add the smallest available load (about 2–5%) and return to the lower end of the range. Add 5 cardio minutes to one session only when current sessions feel manageable; keep within your time budget. Reduce volume or repeat the week if recovery is poor.',loading:'Start with body weight where applicable or a light load you control. No 1RM testing is required. Rest as listed; leave the suggested repetitions in reserve and stop if pain, dizziness or unusual symptoms occur.',sourceIds:['WHO','HHS','ACSM2009','ACSM2011'],method:'GO rules-based starting plan. Exact splits, caps and adaptations are product rules informed by general guidance, not a plan validated by these organizations.'};
}
