import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const read=p=>readFileSync(p,'utf8');
const script=['public/config.js','public/state.js','public/pixel-icons.js','public/content-routes.js','public/genesis-content.js','public/client-preview.js','public/app.js'].map(p=>read(p).replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
async function mount(t){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(read('public/index.html'),{url:'https://demo.example/',runScripts:'outside-only',virtualConsole:vc}),w=dom.window,d=w.document;
 w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});
 w.fetch=async url=>{assert.equal(url,'/data.json');return {ok:true,json:async()=>JSON.parse(read('public/data.json'))};};
 w.PG={applyGenesisLocale:()=>{},connect:async data=>{data.games=data.games.filter(g=>g.provider==='soft-tech');return {home:{chatvice_configured:true,chatvice_enabled:false},manifest:{capabilities:{},settings:{},pages:[]}};},accountState:async()=>({signedIn:false,referral:null})};
 w.PG.api=()=>{throw Error('Preview must not use an operational API');};
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 await w.eval('(async()=>{const PG=window.PG;'+script+'\n})()');
 const navigate=url=>{w.history.pushState({},'',url);w.dispatchEvent(new w.PopStateEvent('popstate'));};
 return {w,d,navigate};
}
test('main website exposes demo menus with backend capabilities disabled and retains its homepage',async t=>{
 const {d,navigate}=await mount(t);
 assert.ok(d.querySelector('.carousel'));assert.ok(d.querySelector('.home-soft-tech'));
 const nav=d.querySelector('.main-nav');
 assert.ok(nav.querySelector('a[href="/casino/category/lobby"]'));
 assert.ok(nav.querySelector('a[href="/user/referral/history"]'));
 assert.equal(nav.lastElementChild.getAttribute('href'),'/contact');
 for(const path of ['/casino/category/lobby','/user/referral/history','/referral']){
  navigate(path);assert.ok(d.querySelector('.client-preview'));assert.ok(d.querySelector('.main-nav'));
  assert.equal(d.querySelector('.client-preview form,.client-preview iframe,.client-preview video'),null);
  assert.match(d.querySelector('.client-preview').textContent,/DEMO CLIENT/);
 }
 assert.equal(existsSync('public/client-demo/index.html'),false);
});
test('studio demo filters and modal use the main shell and do not launch a game',async t=>{
 const {w,d,navigate}=await mount(t);navigate('/casino/category/lobby');
 assert.equal(d.querySelectorAll('.client-studio-card').length,3);
 d.querySelector('[data-action="client-preview-filter"][data-value="B"]').click();
 assert.equal(d.querySelectorAll('.client-studio-card').length,1);
 d.querySelector('[data-action="client-preview-studio"]').click();
 assert.match(d.querySelector('[role="dialog"]').textContent,/Studio Sapphire/);
 assert.equal(d.querySelector('[role="dialog"] iframe,[role="dialog"] video'),null);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(d.querySelector('[role="dialog"]'),null);
 d.querySelector('[data-action="client-preview-reset"]').click();assert.equal(d.querySelectorAll('.client-studio-card').length,3);
 d.querySelector('.client-preview a[href="/"]').click();assert.equal(w.location.pathname,'/');assert.ok(d.querySelector('.carousel'));
});
test('referral demo is accessible without login and only copies an inactive sample code',async t=>{
 const {w,d,navigate}=await mount(t);let copied='';Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async v=>{copied=v;}}});
 navigate('/user/referral/history');assert.equal(d.querySelectorAll('.client-preview tbody tr').length,3);
 d.querySelector('[data-action="client-preview-period"][data-value="weekly"]').click();assert.equal(d.querySelectorAll('.client-preview tbody tr').length,5);
 d.querySelector('[data-action="client-preview-period"][data-value="monthly"]').click();assert.equal(d.querySelectorAll('.client-preview tbody tr').length,6);
 d.querySelector('[data-action="client-preview-copy"]').click();await Promise.resolve();assert.equal(copied,'DEMO-PREVIEW-ONLY');
 assert.equal(d.querySelector('.client-preview a[href*="register"]'),null);
 d.querySelector('[data-action="client-preview-reset"]').click();assert.equal(d.querySelectorAll('.client-preview tbody tr').length,3);
});
