const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
let browser;
(async()=>{
 const {DEFAULT_PROFILE}=await import('../src/model.js');
 const {EXERCISE_DEMOS}=await import('../src/exerciseDemos.js');
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const errors=[];
 for(const gender of ['female','male']) for(const [avatarCharacter,animal] of [['selkirk','cat'],['shiba','dog']]){
  const key=`${gender}-${animal}`;
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1100}});
  await context.addInitScript(profile=>localStorage.setItem('forma-v2',JSON.stringify({version:2,profile,records:{}})),{...DEFAULT_PROFILE,gender,avatarCharacter,days:6});
  const p=await context.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BASE_URL||'http://localhost:5173');
  await p.getByRole('button',{name:'Open navigation',exact:true}).click();
  await p.getByRole('button',{name:'Training',exact:true}).click();
  const chooseDate=async date=>{await p.locator('.date-button').click();await p.getByLabel('Date',{exact:true}).fill(date);await p.getByRole('button',{name:'View day',exact:true}).click()};
  const seen=new Set();
  for(const date of ['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-11']){
   await chooseDate(date);
   for(const demo of await p.locator('.session-outline [data-exercise-demo]').all()){
    assert.equal(await demo.getAttribute('data-training-avatar'),key);
    const visual=await demo.locator('.demo-visual').boundingBox();
    assert.equal(visual.width,176);assert.equal(visual.height,176);
    assert.ok(await demo.locator('.demo-summary > strong').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=18);
    assert.ok(await demo.locator('.demo-phases > span').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=14);
    const video=demo.locator('video');
    assert.ok((await video.getAttribute('src')).startsWith(`/training/${key}/`));
    assert.match(await video.getAttribute('src'), /\?v=[a-f0-9]{12}$/);
    await video.evaluate(async v=>{const img=new Image();img.src=v.poster;await img.decode();if(img.naturalWidth!==400)throw new Error('Invalid poster');});
    assert.ok(await video.evaluate(v=>v.paused),'Reduced-motion users see static posters');
    const id=await demo.getAttribute('data-exercise-demo');
    const expectedRate=['walk','warmup','cardio','cooldown'].includes(id)?3/EXERCISE_DEMOS[id].duration:1;
    assert.ok(Math.abs(await video.evaluate(v=>v.playbackRate)-expectedRate)<1e-6);
    seen.add(id);
   }
  }
  assert.equal(seen.size,22);
  const card=await p.locator('.workout-card').boundingBox();assert.ok(card.width<=300);assert.ok(card.height<280);
  await chooseDate('2026-10-12');
  const first=p.locator('.session-outline [data-exercise-demo="bench"]');
  await first.scrollIntoViewIfNeeded();
  await first.getByRole('button',{name:'Play Barbell bench press demo'}).click();
  await first.locator('video').evaluate(v=>new Promise((resolve,reject)=>{if(v.currentTime>.1)return resolve();v.addEventListener('timeupdate',function tick(){if(v.currentTime>.1){v.removeEventListener('timeupdate',tick);resolve()}});v.addEventListener('error',()=>reject(new Error('Video failed')),{once:true})}));
  const before=await first.locator('video').screenshot();
  await p.waitForTimeout(650);
  assert.equal(before.equals(await first.locator('video').screenshot()),false,'Actual poses change');
  await first.getByRole('button',{name:'Pause Barbell bench press demo'}).click();
  assert.ok(await first.locator('video').evaluate(v=>v.paused));
  await first.getByRole('button',{name:'How to do it',exact:true}).click();
  assert.equal(await first.locator('.demo-instructions li').count(),3);
  await p.getByRole('button',{name:'Start session',exact:true}).click();
  const dialog=p.getByRole('dialog');
  for(const demo of await dialog.locator('[data-exercise-demo]').all()){assert.equal(await demo.getAttribute('data-training-avatar'),key);const box=await demo.locator('.demo-visual').boundingBox();assert.equal(box.width,176);assert.equal(box.height,176);}
  await p.keyboard.press('Escape');
  await p.setViewportSize({width:390,height:844});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const visual of await p.locator('.session-outline .demo-visual').all()){const box=await visual.boundingBox();assert.equal(box.width,144);assert.equal(box.height,144);}
  assert.ok(await first.locator('.demo-summary > strong').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16);
  await p.screenshot({path:`/tmp/go-training-${key}.png`,fullPage:true});
  console.log(`${key}: all 22 mappings, real playback, pause, form tips, session modal, reduced motion and mobile pass`);
  await context.close();
 }
 // An unavailable video must not substitute a different animal or gender.
 const context=await browser.newContext({reducedMotion:'reduce'});
 const profile={...DEFAULT_PROFILE,gender:'female',avatarCharacter:'shiba',days:6};
 await context.addInitScript(profile=>localStorage.setItem('forma-v2',JSON.stringify({version:2,profile,records:{}})),profile);
 await context.route('**/training/female-dog/bench.mp4*',route=>route.abort());
 const p=await context.newPage();await p.goto(process.env.BASE_URL||'http://localhost:5173');
 await p.getByRole('button',{name:'Open navigation',exact:true}).click();await p.getByRole('button',{name:'Training',exact:true}).click();
 await p.locator('.date-button').click();await p.getByLabel('Date',{exact:true}).fill('2026-10-12');await p.getByRole('button',{name:'View day',exact:true}).click();
 const first=p.locator('.session-outline [data-exercise-demo="bench"]');await first.scrollIntoViewIfNeeded();await first.getByRole('button',{name:'Play Barbell bench press demo'}).click();
 await first.getByRole('button',{name:'Retry animation',exact:true}).waitFor();
 assert.equal(await first.locator('.animal-avatar').getAttribute('data-gender'),'female');assert.equal(await first.locator('.animal-avatar').getAttribute('data-species'),'shiba');
 await context.unroute('**/training/female-dog/bench.mp4*');await first.getByRole('button',{name:'Retry animation',exact:true}).click();
 await first.locator('video').waitFor();await p.waitForFunction(()=>document.querySelector('[data-exercise-demo="bench"] video')?.currentTime>.1);
 assert.deepEqual(errors,[]);await context.close();await browser.close();
 console.log('PASS: Media failure keeps the selected character, and retry recovers.');
})().catch(async error=>{console.error(error);await browser?.close();process.exit(1)});
