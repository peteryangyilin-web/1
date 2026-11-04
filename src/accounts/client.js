import {createClient} from '@supabase/supabase-js';
import {publicSupabaseConfig,emptyWorkspace,normalizeWorkspace} from './workspace.js';
import publicProject from './project.public.json';
export const accountConfig=publicSupabaseConfig(import.meta.env,publicProject);
export const supabase=accountConfig.configured?createClient(accountConfig.url,accountConfig.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export async function loadWorkspace(user){
 let {data,error}=await supabase.from('go_workspaces').select('data,revision,updated_at').eq('user_id',user.id).maybeSingle();
 if(error)throw error;
 if(!data){
  const initial=emptyWorkspace(user.user_metadata?.full_name);
  const result=await supabase.from('go_workspaces').insert({user_id:user.id,data:initial}).select('data,revision,updated_at').single();
  if(result.error?.code==='23505')return loadWorkspace(user);
  if(result.error)throw result.error;data=result.data;
 }
 return {...data,data:normalizeWorkspace(data.data,user.user_metadata?.full_name)};
}
export async function persistWorkspace(data,revision,userId){
 const result=await supabase.rpc('go_save_workspace',{p_data:data,p_expected_revision:revision,p_user_id:userId});
 if(result.error)throw result.error;
 return result.data;
}
export function readableError(error,fallback='Something went wrong. Please try again.'){
 if(error?.code==='40001')return 'Your account was updated on another device. Export your current changes or load the latest saved version before continuing.';
 if(error?.status===429||/rate limit|too many|after \d+ seconds/i.test(error?.message||''))return 'Please wait a little before requesting another code.';
 if(/otp.*expired|token.*expired|invalid.*otp|invalid.*token/i.test(error?.message||''))return 'That code is invalid or expired. Check it or request a new one.';
 if(/phone_provider_disabled/.test(error?.code||'')||/phone provider|sms provider|unsupported phone|phone logins are disabled/i.test(error?.message||''))return 'SMS sign-in is not available right now. Try email or contact GO support.';
 if(/fetch|network|offline/i.test(error?.message||''))return 'Unable to connect. Check your connection and try again.';
 return fallback;
}
