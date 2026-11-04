import React,{useState} from 'react';
import {supabase,accountConfig,readableError} from './client';
import {normalizeContact} from './workspace';
import PasswordForm from './PasswordForm';
export function ResetLinkForm({initialEmail=''}){
 const [email,setEmail]=useState(initialEmail),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
 const submit=async e=>{e.preventDefault();if(!supabase)return;setBusy(true);setError('');setSent(false);try{const normalized=normalizeContact('email',email);const result=await supabase.auth.resetPasswordForEmail(normalized,{redirectTo:new URL('/auth/reset-password',location.origin).href});if(result.error)throw result.error;setSent(true);}catch(e){setError(e.message==='Enter a valid email address.'?e.message:readableError(e,'We could not send a reset link. Please try again later.'))}finally{setBusy(false)}};
 return <form onSubmit={submit}><label className="account-field">Email address<input aria-label="Email address" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><button className="account-primary" disabled={busy||!accountConfig.configured}>{busy?'Sending…':'Send reset link'}</button>{sent&&<p role="status" className="account-success">If an account exists for this email, a password reset link has been sent. Open that link to choose a new password.</p>}{error&&<p role="alert" className="account-alert">{error}</p>}</form>;
}
export default function PasswordRecovery({user,onContinue}){
 const [saved,setSaved]=useState(false);
 return <main className="account-page account-recovery"><a href="/" className="account-logo" aria-label="GO home">G<span>O</span></a><section className="account-card"><span className="account-kicker">A FRESH START</span><h1>{user?'Choose a new password.':'Reset your password.'}</h1>{user?<><p>Choose a new password for <strong>{user.email||user.phone||'your verified account'}</strong>.</p><PasswordForm onSuccess={()=>setSaved(true)} buttonLabel="Save new password"/>{saved&&<button className="account-text-button" onClick={onContinue}>Continue to GO</button>}</>:<><p>Open a fresh reset link from your email. If your link has expired, request another below.</p><ResetLinkForm/></>}{!accountConfig.configured&&<p role="status" className="account-alert">Account sign-in is not available yet.</p>}</section></main>;
}
