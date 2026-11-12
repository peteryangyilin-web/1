export const completeProfile = (overrides={}) => ({
 age:25,height:175,startWeight:85,goal:'fatloss',days:4,
 trainingSetup:{history:'beginner',technique:'familiar',equipment:'gym',capacity:20,currentActivity:{moderate_minutes_per_week:0,vigorous_minutes_per_week:0},windows:[0,1,3,5].map(day=>({day,minutes:60})),health:{warningSymptoms:'no',knownCondition:'no',currentPain:'no',specialCare:'no'}},...overrides,
});
