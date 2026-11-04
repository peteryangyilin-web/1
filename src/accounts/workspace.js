import {DEFAULT_PROFILE} from '../model.js';
export function emptyWorkspace(name='') {
 return {version:2,profile:{...DEFAULT_PROFILE,name:String(name||'').trim().slice(0,120),goal:null,age:null,height:null,startWeight:null,targetWeight:null,calories:null,protein:null,carbs:null,fats:null,experience:'beginner',days:3},records:{}};
}
export function normalizeWorkspace(data,name='') {
 const valid=data&&data.version===2&&data.records&&typeof data.records==='object'&&!Array.isArray(data.records);
 if(!valid)return emptyWorkspace(name);
 const profile={...emptyWorkspace(name).profile,...(data.profile&&typeof data.profile==='object'&&!Array.isArray(data.profile)?data.profile:{})};
 profile.name=typeof profile.name==='string'?profile.name.slice(0,120):String(name||'').slice(0,120);
 return {version:2,profile,records:data.records,...(data.simulation?{simulation:data.simulation}:{})};
}
export function readLegacyWorkspace(storage=globalThis.localStorage) {
 try {const data=JSON.parse(storage.getItem('forma-v2'));if(data?.version===2&&data.records&&typeof data.records==='object'&&!Array.isArray(data.records))return normalizeWorkspace(data);}catch{}
 return null;
}
export function hasLegacyProgress(data) {
 return !!data&&(Object.keys(data.records||{}).length>0||!!data.profile?.gender||!!data.profile?.bodyType||!!data.simulation);
}
export function normalizeContact(method,value='') {
 const text=String(value).trim();
 if(method==='phone'){if(!/^\+[1-9]\d{7,14}$/.test(text))throw new Error('Use an international phone number, including the country code, such as +14155552671.');return text;}
 const email=text.toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter a valid email address.');return email;
}
export function verifiedContacts(user) {
 return {email:user?.email_confirmed_at?user.email:null,phone:user?.phone_confirmed_at?user.phone:null};
}
export function publicSupabaseConfig(env={}) {
 const url=String(env.VITE_SUPABASE_URL||'').trim(),key=String(env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_ANON_KEY||'').trim();
 if(!url&&!key)return {configured:false};
 if(!url||!key)return {configured:false,error:'Account service setup is incomplete.'};
 try{const parsed=new URL(url);if(parsed.protocol!=='https:'&&!(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)))throw new Error();}catch{return {configured:false,error:'Account service URL is invalid.'};}
 let privileged=key.startsWith('sb_secret_');
 try{privileged ||= JSON.parse(atob(key.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).role==='service_role';}catch{}
 if(privileged)return {configured:false,error:'A private server key cannot be used in this application.'};
 return {configured:true,url,key};
}
