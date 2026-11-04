import React,{useState,useEffect} from 'react';
import {ArrowRight,ArrowLeft,Mail,Phone,Check,ShieldCheck} from 'lucide-react';
import {supabase,accountConfig,readableError} from './client';
import {normalizeContact} from './workspace';
import {passwordIssue} from './passwords';
import {PasswordInput} from './PasswordForm';
import {ResetLinkForm} from './PasswordRecovery';
import './accounts.css';
export default function AuthPage({initialIntent='signup'}){
 const [intent,setIntent]=useState(initialIntent),[method,setMethod]=useState('email'),[mode,setMode]=useState('password');
 const [contact,setContact]=useState(''),[name,setName]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[consent,setConsent]=useState(false);
 const [sent,setSent]=useState(null),[code,setCode]=useState(''),[forgot,setForgot]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[nextSend,setNextSend]=useState(0),[now,setNow]=useState(Date.now());
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);
 const cooldown=Math.max(0,Math.ceil((nextSend-now)/1000));
 const clearPasswords=()=>{setPassword('');setConfirm('')};
 const resetIntent=id=>{setIntent(id);setMode('password');setError('');clearPasswords()};
 const submit=async e=>{
  e.preventDefault();if(!supabase)return;setError('');setBusy(true);
  try{
   const normalized=normalizeContact(method,contact);
   let result;
   if(intent==='signup'){
    if(!name.trim()||!consent){setError('Enter your name and confirm the account information notice.');return;}
    const issue=passwordIssue(password,confirm);if(issue){setError(issue);return;}
    const options={data:{full_name:name.trim().slice(0,120),privacy_consent_at:new Date().toISOString()},...(method==='email'?{emailRedirectTo:new URL('/',location.origin).href}:{})};
    result=await supabase.auth.signUp({[method]:normalized,password,options});
   }else if(mode==='password'){
    result=await supabase.auth.signInWithPassword({[method]:normalized,password});
   }else{
    result=await supabase.auth.signInWithOtp({[method]:normalized,options:{shouldCreateUser:false,...(method==='email'?{emailRedirectTo:new URL('/',location.origin).href}:{})}});
    if(result.error&&/signup|not found/i.test(result.error.message))result={data:{},error:null};
   }
   if(result.error)throw result.error;
   clearPasswords();
   if((intent==='signup'&&!result.data.session)||(intent==='signin'&&mode==='code')){
    setSent({method,contact:normalized,purpose:intent==='signup'?'signup':'signin'});setCode('');setNextSend(Date.now()+60000);
   }else if(!result.data.session){throw new Error('No session returned')}
  }catch(e){setError(/^Enter |^Use an international/.test(e.message)?e.message:readableError(e,mode==='password'&&intent==='signin'?'We could not sign you in. Check your email or phone and password, or use a verification code.':'Your account could not be created right now. Check your details and try again.'));}finally{setBusy(false)}
 };
 const resend=async()=>{if(!supabase||!sent||cooldown)return;setError('');setBusy(true);try{let result;if(sent.purpose==='signup')result=await supabase.auth.resend({type:sent.method==='email'?'signup':'sms',[sent.method]:sent.contact,options:sent.method==='email'?{emailRedirectTo:new URL('/',location.origin).href}:undefined});else result=await supabase.auth.signInWithOtp({[sent.method]:sent.contact,options:{shouldCreateUser:false,...(sent.method==='email'?{emailRedirectTo:new URL('/',location.origin).href}:{})}});if(result.error)throw result.error;setNextSend(Date.now()+60000);}catch(e){setError(readableError(e,'We could not send another message right now.'))}finally{setBusy(false)}};
 const verify=async e=>{e.preventDefault();setError('');setBusy(true);try{const result=await supabase.auth.verifyOtp({[sent.method]:sent.contact,token:code.trim(),type:sent.method==='phone'?'sms':'email'});if(result.error)throw result.error;if(!result.data.session)throw new Error('No session');}catch(e){setError(readableError(e,'We could not verify this code. Check it or request a new one.'))}finally{setBusy(false)}};
 const codeForm=<form onSubmit={verify}><label className="account-field">Verification code<input aria-label="Verification code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,8))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" required/></label><button className="account-primary" disabled={busy}>{busy?'Verifying…':'Verify & continue'}<ArrowRight size={17}/></button></form>;
 return <main className="account-page"><a href="/" className="account-logo" aria-label="GO home">G<span>O</span></a><div className="account-entry"><section className="account-story"><span className="account-kicker">YOUR OWN KIND OF STRONGER</span><h1>A little progress.<br/>All yours.</h1><p>Your plan, meals and milestones, together in your own GO account.</p><div className="account-promises"><span><Check size={16}/> Your information, your profile</span><span><Check size={16}/> Pick up on another device</span><span><ShieldCheck size={16}/> Password sign-in. Verified contacts.</span></div></section><section className="account-card" aria-label="GO account">
  {forgot?<><button className="account-back" onClick={()=>setForgot(false)}><ArrowLeft size={15}/> Back to sign in</button><h2>A fresh start.</h2><p>We’ll email you a link to choose a new password.</p><ResetLinkForm initialEmail={method==='email'?contact:''}/></>:sent?<>
   <button className="account-back" onClick={()=>{setSent(null);setError('');setCode('')}} disabled={busy}><ArrowLeft size={15}/> Change details</button><span className="account-kicker">ONE LAST STEP</span><h2>Check your {sent.method==='phone'?'messages':'inbox'}.</h2>
   <p>{sent.method==='email'?'Open the verification link in the email sent to':'Enter the verification code sent to'} <strong>{sent.contact}</strong>{sent.purpose==='signup'?' to finish creating your account.':'. A sign-in message is sent only for an existing account.'}</p>
   {sent.method==='email'?<details className="account-email-code"><summary>I received a code instead</summary>{codeForm}</details>:codeForm}
   <button className="account-text-button" disabled={busy||cooldown>0} onClick={resend}>{cooldown?`Send another message in ${cooldown}s`:'Send another verification message'}</button>
  </>:<>
   <div className="account-tabs" role="group" aria-label="Account action">{[['signup','Create account'],['signin','Sign in']].map(([id,label])=><button key={id} onClick={()=>resetIntent(id)} aria-pressed={intent===id}>{label}</button>)}</div><h2>{intent==='signup'?'Make room for you.':'Welcome back.'}</h2><p>{intent==='signup'?'Create your personal GO space and choose a password.':mode==='password'?'Sign in with your verified email or phone and password.':'Use a verification link or code to access your account.'}</p>
   <div className="account-method" role="group" aria-label="Sign-in contact">{[['email',Mail,'Email'],['phone',Phone,'Phone']].map(([id,Icon,label])=><button key={id} type="button" aria-pressed={method===id} onClick={()=>{setMethod(id);setContact('');setError('');clearPasswords()}}><Icon size={16}/>{label}</button>)}</div>
   <form onSubmit={submit}>
    {intent==='signup'&&<label className="account-field">Your name<input aria-label="Your name" value={name} onChange={e=>setName(e.target.value)} required maxLength={120} pattern={'.*\\S.*'} autoComplete="name" placeholder="What should we call you?"/></label>}
    <label className="account-field">{method==='email'?'Email address':'Phone number'}<input aria-label={method==='email'?'Email address':'Phone number'} type={method==='email'?'email':'tel'} autoComplete={method==='email'?'email':'tel'} value={contact} onChange={e=>setContact(e.target.value)} required maxLength={254} placeholder={method==='email'?'you@example.com':'+14155552671'}/></label>{method==='phone'&&<p className="account-small">Include your country code, starting with +. Phone verification requires SMS delivery.</p>}
    {(intent==='signup'||mode==='password')&&<PasswordInput label="Password" value={password} onChange={setPassword} autoComplete={intent==='signup'?'new-password':'current-password'} minimum={intent==='signup'?8:undefined}/>}
    {intent==='signup'&&<><PasswordInput label="Confirm password" value={confirm} onChange={setConfirm} minimum={8}/><p className="account-small">Use at least 8 characters. Verify your email or phone after creating your account.</p><label className="account-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/><span>I understand GO saves my contact details and fitness information to my account. GO administrators can view this information to manage and support the service. <a href="/privacy.html" target="_blank" rel="noreferrer">Read the privacy notice</a>.</span></label></>}
    <button className="account-primary" disabled={busy||!accountConfig.configured}>{busy?'Please wait…':intent==='signup'?'Create your account':mode==='password'?'Sign in to GO':'Send verification code'}<ArrowRight size={17}/></button>
   </form>
   {intent==='signin'&&<><button className="account-text-button" onClick={()=>{setMode(v=>v==='password'?'code':'password');setError('');clearPasswords()}}>{mode==='password'?'Use a verification code instead':'Use a password instead'}</button>{method==='email'&&mode==='password'&&<button className="account-text-button" onClick={()=>{clearPasswords();setError('');setForgot(true)}}>Forgot password?</button>}{mode==='password'&&<p className="account-small">Previously used an email link? Use verification sign-in, then set a password in Account.</p>}</>}
  </>}
  {!accountConfig.configured&&<p role="status" className="account-alert">{accountConfig.error||'Account sign-in is not available yet. Please try again later.'}</p>}{error&&<p role="alert" className="account-alert">{error}</p>}<p className="account-small">Never share your password or verification code. GO administrators cannot see them.</p>
 </section></div></main>;
}
