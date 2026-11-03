import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {server} from '../server.mjs';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('health reports demo',async()=>{const r=await fetch(base+'/health');assert.equal(r.status,200);assert.equal((await r.json()).mode,'frontend-demo');});
test('131 routes support direct loading',async()=>{for(const route of JSON.parse(readFileSync('docs/reference/gobi88-route-inventory.json')).routes){const r=await fetch(base+route.path);assert.equal(r.status,200,route.path);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/id="app"/);}});
test('238 images serve correct bytes and media types',async()=>{for(const a of JSON.parse(readFileSync('docs/reference/asset-copy-manifest.json')).assets){const r=await fetch(base+a.localPath);assert.equal(r.status,200,a.localPath);assert.match(r.headers.get('content-type'),/^image\//);assert.equal((await r.arrayBuffer()).byteLength,a.bytes);}});
test('missing files and API writes fail safely',async()=>{assert.equal((await fetch(base+'/assets/missing.webp')).status,404);assert.equal((await fetch(base+'/api/deposit',{method:'POST',body:'1000'})).status,405);assert.equal((await fetch(base+'/api/wallet')).status,404);});
test('responsive preview serves its controls with same-origin-only embedding',async()=>{
  const response=await fetch(base+'/preview/');assert.equal(response.status,200);
  assert.match(await response.text(),/title="Website Playground"/);
  const csp=response.headers.get('content-security-policy');
  assert.match(csp,/frame-src 'self';/);assert.match(csp,/frame-ancestors 'self'/);
  const script=await fetch(base+'/preview/preview.js');assert.equal(script.status,200);assert.match(script.headers.get('content-type'),/javascript/);
});
