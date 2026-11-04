import React,{useState} from 'react';
import {Eye,EyeOff} from 'lucide-react';
import {supabase,readableError} from './client';
import {passwordIssue} from './passwords';
export function PasswordInput({label,value,onChange,autoComplete='new-password',minimum}){
 const [visible,setVisible]=useState(false);
 return <label className="account-field">{label}<span className="account-password-input"><input aria-label={label} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} required minLength={minimum} maxLength={256} autoComplete={autoComplete}/><button type="button" aria-label={`${visible?'Hide':'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>;
}
export default function PasswordForm({onSuccess,buttonLabel='Save password'}){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const submit=async e=>{e.preventDefault();setError('');setSaved(false);const issue=passwordIssue(password,confirm);if(issue){setError(issue);return;}setBusy(true);try{const result=await supabase.auth.updateUser({password});if(result.error)throw result.error;setPassword('');setConfirm('');setSaved(true);onSuccess?.();}catch(error){setError(readableError(error,'Your password could not be saved. Try again or sign in again using a verification link.'))}finally{setBusy(false)}};
 return <form onSubmit={submit} aria-label="Set your GO password"><PasswordInput label="New password" value={password} onChange={v=>{setPassword(v);setSaved(false)}} minimum={8}/><PasswordInput label="Confirm new password" value={confirm} onChange={v=>{setConfirm(v);setSaved(false)}} minimum={8}/><p className="account-small">Use at least 8 characters. Your password is never saved in your fitness records or shown to GO administrators.</p><button className="account-primary" disabled={busy||!password||!confirm}>{busy?'Saving…':buttonLabel}</button>{error&&<p role="alert" className="account-alert">{error}</p>}{saved&&<p role="status" className="account-success">Your password has been updated.</p>}</form>;
}
