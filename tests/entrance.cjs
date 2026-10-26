const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
let browser;
(async () => {
  browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const errors = [];
  const page = async (options={}) => {
    const p = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference',...options});
    p.on('pageerror', e=>errors.push(e.message));
    return p;
  };
  const unlocked = async p => {
    await p.locator('#go-intro').waitFor({state:'detached',timeout:15000});
    assert.equal(await p.locator('#root').getAttribute('inert'),null);
    assert.equal(await p.locator('html').evaluate(e=>e.classList.contains('go-entering')),false);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  };
  await Promise.all([
    (async()=>{
      const p=await page(); await p.goto(base);
      await p.locator('#go-intro.go-intro-ready').waitFor();
      const startedAt = Date.now();
      assert.equal(await p.locator('#root').getAttribute('inert'),'');
      assert.match(await p.locator('.go-intro-image').getAttribute('src'), /go-loading-4s\.gif$/);
      assert.deepEqual(await p.locator('.go-intro-image').evaluate(i=>[i.naturalWidth,i.naturalHeight]),[480,400]);
      const box=await p.locator('.go-intro-image').boundingBox();
      assert(Math.abs(box.x+box.width/2-195)<1);
      await p.waitForTimeout(600); assert.equal(await p.locator('#go-intro').count(),1);
      await unlocked(p);
      const elapsed = Date.now() - startedAt;
      assert(elapsed > 3300 && elapsed < 5500, `intro should finish in about four seconds, got ${elapsed}ms`);
      await p.getByRole('button',{name:'Get started',exact:true}).click();
      assert.equal(await p.locator('#go-intro').count(),0,'internal navigation does not replay');
      await p.close();
    })(),
    (async()=>{
      const p=await page(); await p.goto(base);
      await p.getByRole('button',{name:'Skip intro',exact:true}).click(); await unlocked(p);
      await p.reload(); await p.locator('#go-intro').waitFor(); await p.keyboard.press('Escape'); await unlocked(p);
      await p.reload(); await p.locator('#go-intro').waitFor(); await p.emulateMedia({reducedMotion:'reduce'}); await unlocked(p);
      await p.close();
    })(),
    (async()=>{
      const p=await page({reducedMotion:'reduce'}); await p.goto(base); await unlocked(p); await p.close();
    })(),
    (async()=>{
      const p=await page(); await p.route('**/branding/go-loading-4s.gif',r=>r.abort()); await p.goto(base); await unlocked(p); await p.close();
    })(),
  ]);
  assert.deepEqual(errors,[]);
  console.log('PASS four-second full-sequence GIF playback and automatic entry, centered mobile layout, Skip/Escape, reduced motion and failed-image fallback; interactions unlock and navigation does not replay');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
