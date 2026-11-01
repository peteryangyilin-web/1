export const GLASS_ML = 250;
export const ACTIVITY_OPTIONS = [
  {id:'light',label:'Mostly sitting',definition:'A desk-based day, with less than about 30 minutes of walking outside workouts.'},
  {id:'moderate',label:'Some daily movement',definition:'About 30–60 minutes of walking, errands or commuting outside workouts.'},
  {id:'active',label:'Frequently on my feet',definition:'Usually more than 4 hours standing/moving, or over 60 minutes walking outside workouts.'},
];
export const GOAL_LABELS={muscle:'Build muscle',fatloss:'Lose fat',endurance:'Improve endurance',wellbeing:'Feel healthier'};
const round=(n,step=1)=>Number((Math.round(n/step)*step).toFixed(2));
const positive=n=>Number.isFinite(Number(n))&&Number(n)>0;
export function getProfileGuidance(profile={}) {
 const goal=GOAL_LABELS[profile.goal]?profile.goal:'muscle';
 const weight=Number(profile.startWeight),age=Number(profile.age),height=Number(profile.height);
 const bmi=positive(height)&&positive(weight)?weight/(height/100)**2:null;
 const adult=age>=18&&age<=80;
 const canEstimate=adult&&height>=130&&height<=220&&weight>=35&&weight<=220&&bmi>=18.5&&bmi<=35;
 const canLose=canEstimate&&bmi>=20;
 const desiredDelta=goal==='muscle'?150:goal==='fatloss'&&canLose?-250:0;
 const factor=({light:1.3,moderate:1.45,active:1.6}[profile.activity]||1.45)+Math.min(Number(profile.days)||3,4)*.025;
 let energy=null, macros={calories:null,protein:null,carbs:null,fats:null};
 if(canEstimate){
  const base=10*weight+6.25*height-5*age;
  const low=round(Math.max(1500,(base-161)*factor+desiredDelta),50);
  const high=Math.max(low+100,round((base+5)*factor+desiredDelta,50));
  const calories=round((low+high)/2,50);
  const protein=round(weight*({muscle:1.6,fatloss:1.6,endurance:1.4,wellbeing:1.2}[goal]));
  const fats=round(Math.max(calories*.2/9,Math.min(calories*.35/9,weight*.8)));
  const carbs=round(Math.max(0,(calories-4*protein-9*fats)/4));
  energy={low,high,adjustment:desiredDelta,maintenance:round(((base-161)+(base+5))/2*factor,50)};
  macros={calories,protein,fats,carbs};
 }
 const targetWeight=positive(weight)?round(weight+(canEstimate?(goal==='muscle'?weight*.01:goal==='fatloss'&&canLose?-weight*.02:0):0),.1):null;
 const steps={light:6000,moderate:8000,active:10000}[profile.activity]||8000;
 const reasons={
  muscle:'Build around progressive strength, regular meals and a small energy surplus. A small scale-weight increase is not a prediction of muscle gain.',
  fatloss:canLose?'Keep strength training while adding steady movement. Start with a modest energy reduction and review the trend after 2–4 weeks.':'Start with strength, regular meals and daily movement. A calorie deficit is not suggested without a suitable adult starting point.',
  endurance:'Prioritize comfortable cardio and supporting strength. Use session duration and an easier breathing pace as progress signals.',
  wellbeing:'Start with repeatable movement, enough sleep and balanced meals. There is no automatic weight-loss target for this goal.',
 };
 let missing='';
 if(!canEstimate)missing=age>0&&age<18?'For under-18s, use habit goals; calorie and weight-change targets need individual professional guidance.':!positive(age)||!positive(height)||!positive(weight)?'Add your age, height and current weight for an energy estimate. You can save habit goals and log food without a calorie target.':'These measurements need more individual guidance than this estimator can provide. You can still use habit goals and log meals.';
 return {goal,label:GOAL_LABELS[goal],energy,missing,reasons:reasons[goal],weightNote:!canEstimate?'Keep your starting weight as a reference; no automatic weight-change target is suggested from the information provided.':goal==='muscle'?'A gentle four-week scale-weight starting point (about +1%). Review strength, energy and comfort too.':goal==='fatloss'&&canLose?'A modest four-week starting point (about −2% of current weight), not a deadline or a guaranteed result.':'Maintain your starting weight while focusing on fitness and habits; a scale change is optional.',targets:{...macros,targetWeight,steps,sleep:8,water:8},habits:[{key:'steps',label:'Daily movement',value:`${steps.toLocaleString()} steps`,reason:'A flexible starting point based on your day-to-day activity; build up gradually from what feels comfortable.'},{key:'sleep',label:'Sleep',value:'8 hours',reason:'Most adults do well with about 7–9 hours; adjust for your own needs.'},{key:'water',label:'Drinks',value:'8 glasses · 2,000 mL',reason:'One glass is 250 mL. A starting reminder, not a fixed fluid requirement; food, heat and exercise change your needs.'}]};
}
