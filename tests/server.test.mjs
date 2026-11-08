import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {server} from '../server.mjs';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('health reports Playground connection mode',async()=>{const r=await fetch(base+'/health');assert.equal(r.status,200);assert.equal((await r.json()).mode,'playground-connected');});
test('old standalone demo URLs redirect to the main website',async()=>{
 for(const path of ['/client-demo','/client-demo/','/client-demo/index.html']){
  const response=await fetch(base+path,{redirect:'manual'});assert.equal(response.status,302);assert.equal(response.headers.get('location'),'/');
 }
 assert.equal((await fetch(base+'/client-demo/demo.js')).status,404);
 const home=await fetch(base+'/');assert.match(await home.text(),/href="\/client-preview.css"/);
});
test('UNO v3 streams exact MP4 bytes and allows warmed blob media under CSP',async()=>{
 const path='/assets/soft-tech/video/uno-luck-v3.mp4';
 const expected=readFileSync('public'+path);
 const full=await fetch(base+path);
 assert.equal(full.status,200);
 assert.equal(full.headers.get('content-type'),'video/mp4');
 assert.deepEqual(Buffer.from(await full.arrayBuffer()),expected);
 const partial=await fetch(base+path,{headers:{Range:'bytes=0-1023'}});
 assert.equal(partial.status,206);
 assert.equal(partial.headers.get('content-range'),`bytes 0-1023/${expected.length}`);
 assert.deepEqual(Buffer.from(await partial.arrayBuffer()),expected.subarray(0,1024));
 const home=await fetch(base+'/');
 assert.match(home.headers.get('content-security-policy'),/media-src 'self' blob: https:\/\/chatvice\.app;/);
 const html=await home.text();
 assert.ok(html.indexOf('src="/video-warmup.js"')<html.indexOf('src="/app.js"'));
});
test('131 routes support direct loading',async()=>{for(const route of JSON.parse(readFileSync('docs/reference/gobi88-route-inventory.json')).routes){const r=await fetch(base+route.path);assert.equal(r.status,200,route.path);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/id="app"/);}});
test('238 images serve correct bytes and media types',async()=>{for(const a of JSON.parse(readFileSync('docs/reference/asset-copy-manifest.json')).assets){const r=await fetch(base+a.localPath);assert.equal(r.status,200,a.localPath);assert.match(r.headers.get('content-type'),/^image\//);assert.equal((await r.arrayBuffer()).byteLength,a.bytes);}});
test('missing files and API writes fail safely',async()=>{assert.equal((await fetch(base+'/assets/missing.webp')).status,404);assert.equal((await fetch(base+'/api/deposit',{method:'POST',body:'1000'})).status,404);assert.equal((await fetch(base+'/api/wallet')).status,404);});
test('responsive preview permits only its own origin and the Chatvice support frame',async()=>{
  const response=await fetch(base+'/preview/');assert.equal(response.status,200);
  assert.match(await response.text(),/title="Website Playground"/);
  const csp=response.headers.get('content-security-policy');
  assert.match(csp,/frame-src 'self' https:\/\/chatvice\.app;/);assert.match(csp,/frame-ancestors 'self'/);
  const script=await fetch(base+'/preview/preview.js');assert.equal(script.status,200);assert.match(script.headers.get('content-type'),/javascript/);
});
test('64COR support script is allowed by the narrowly scoped CSP',async()=>{
  const response=await fetch(base+'/');
  const csp=response.headers.get('content-security-policy');
  assert.match(csp,/script-src 'self' https:\/\/chatvice\.app;/);
  assert.match(csp,/connect-src 'self' https:\/\/chatvice\.app wss:\/\/chatvice\.app;/);
  assert.doesNotMatch(await response.text(), /<script[^>]+merchant=/); const loader=await fetch(base+'/chatvice.js'); assert.equal(loader.status,200); assert.match(await loader.text(),/agency:help-context/);
});

test('Chatvice promo media is allowed by the host CSP', async () => {
  const csp = (await fetch(base)).headers.get('content-security-policy');
  assert.match(csp, /media-src 'self' blob: https:\/\/chatvice\.app;/);
});
