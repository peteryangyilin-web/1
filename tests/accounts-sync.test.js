import {test} from 'node:test';import assert from 'node:assert/strict';
import {WorkspaceSync} from '../src/accounts/sync.js';
import {emptyWorkspace,normalizeWorkspace,readLegacyWorkspace,hasLegacyProgress,normalizeContact,publicSupabaseConfig,verifiedContacts} from '../src/accounts/workspace.js';
const turn=()=>new Promise(resolve=>setTimeout(resolve,0));
test('new people never get a sample name, contact validation and public config reject unsafe values',()=>{
 assert.equal(emptyWorkspace().profile.name,'');assert.equal(emptyWorkspace().profile.startWeight,null);assert.equal(emptyWorkspace().profile.goal,null);assert.equal(emptyWorkspace().profile.calories,null);assert.equal(emptyWorkspace('  Alice  ').profile.name,'Alice');assert.equal(normalizeWorkspace(null,'Bob').profile.name,'Bob');
 assert.equal(normalizeContact('email',' ALICE@EXAMPLE.COM '),'alice@example.com');assert.equal(normalizeContact('phone','+14155552671'),'+14155552671');assert.throws(()=>normalizeContact('phone','4155552671'));assert.throws(()=>normalizeContact('email','not email'));
 assert.equal(publicSupabaseConfig({}).configured,false);assert.equal(publicSupabaseConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_private'}).configured,false);
 const token=`x.${btoa(JSON.stringify({role:'service_role'}))}.x`;assert.equal(publicSupabaseConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:token}).configured,false);
 assert.equal(publicSupabaseConfig({VITE_SUPABASE_URL:'javascript:alert(1)',VITE_SUPABASE_PUBLISHABLE_KEY:'public'}).configured,false);
 assert.equal(publicSupabaseConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_public'}).configured,true);
 assert.deepEqual(verifiedContacts({email:'not-verified@example.test',phone:'+14155552671'}),{email:null,phone:null});assert.equal(verifiedContacts({email:'alice@example.test',email_confirmed_at:'now'}).email,'alice@example.test');
 assert.equal(readLegacyWorkspace({getItem:()=>'{bad json'}),null);assert.equal(hasLegacyProgress(emptyWorkspace()),false);
});
test('cloud writes serialize, preserve the latest edit and use the returned revision',async()=>{
 const writes=[],statuses=[];let resolveFirst;const sync=new WorkspaceSync({initialData:{value:0},revision:4,delay:10000,onStatus:s=>statuses.push(s.state),save:async(data,revision)=>{writes.push([data.value,revision]);if(writes.length===1)await new Promise(r=>resolveFirst=r);return{revision:revision+1}}});
 sync.enqueue({value:1});const first=sync.flush();sync.enqueue({value:2});sync.enqueue({value:3});await sync.flush();assert.equal(writes.length,1);resolveFirst();await first;assert.deepEqual(writes,[[1,4],[3,5]]);assert.equal(sync.revision,6);assert.equal(sync.dirty,false);assert.equal(statuses.at(-1),'saved');sync.dispose();
});
test('offline data survives retry, a stale revision never overwrites and disposed queues cannot cross accounts',async()=>{
 let fail=true,calls=0;const statuses=[];const sync=new WorkspaceSync({initialData:{x:0},revision:0,delay:10000,onStatus:s=>statuses.push(s.state),save:async()=>{calls++;if(fail)throw new Error('offline');return{revision:1}}});sync.enqueue({x:1});await sync.flush();assert.equal(sync.dirty,true);assert.equal(statuses.at(-1),'error');fail=false;await sync.retry();assert.equal(sync.dirty,false);assert.equal(calls,2);sync.dispose();
 let conflicted=0;const conflict=new WorkspaceSync({initialData:{},revision:0,delay:10000,onStatus:()=>{},save:async()=>{conflicted++;throw{code:'40001'}}});conflict.enqueue({x:1});await conflict.flush();conflict.enqueue({x:2});await conflict.retry();assert.equal(conflicted,1);assert.equal(conflict.dirty,true);conflict.dispose();
 let afterDispose=0;const stopped=new WorkspaceSync({initialData:{},revision:0,delay:0,onStatus:()=>{},save:async()=>{afterDispose++;return{revision:1}}});stopped.enqueue({x:1});stopped.dispose();await turn();assert.equal(afterDispose,0);
});

test('an ambiguous failed write cannot be declared saved just because a user reverted the value',async()=>{
 const statuses=[];let calls=0;const sync=new WorkspaceSync({initialData:{x:0},revision:0,delay:10000,onStatus:s=>statuses.push(s.state),save:async()=>{calls++;throw new Error('response lost')}});sync.enqueue({x:1});await sync.flush();sync.enqueue({x:0});assert.equal(sync.dirty,true);assert.notEqual(statuses.at(-1),'saved');await sync.retry();assert.equal(calls,2);sync.dispose();
});

test('a public project file can connect the site without mixing it with deployment overrides',()=>{
 const project={url:'https://project-a.supabase.co',publishableKey:'sb_publishable_project_a'};
 assert.deepEqual(publicSupabaseConfig({},project),{configured:true,url:project.url,key:project.publishableKey});
 const overrides={VITE_SUPABASE_URL:'https://project-b.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_project_b'};
 assert.deepEqual(publicSupabaseConfig(overrides,project),{configured:true,url:overrides.VITE_SUPABASE_URL,key:overrides.VITE_SUPABASE_PUBLISHABLE_KEY});
 assert.equal(publicSupabaseConfig({VITE_SUPABASE_URL:'https://project-b.supabase.co'},project).configured,false);
 assert.equal(publicSupabaseConfig({},{}).configured,false);
 assert.equal(publicSupabaseConfig(overrides,{...project,publishableKey:'sb_secret_never_ship'}).configured,false,'Even an overridden private key must reject the build');
 assert.equal(publicSupabaseConfig({...overrides,VITE_SUPABASE_ANON_KEY:'sb_secret_unused'}).configured,false);
});
