import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const html=readFileSync('public/client-demo/index.html','utf8');
const source=readFileSync('public/client-demo/demo.js','utf8');
function mount(t){
 const dom=new JSDOM(html,{url:'https://demo.example/client-demo/',runScripts:'outside-only'}),w=dom.window;
 t.after(()=>w.close());
 w.scrollTo=()=>{};
 w.fetch=()=>{throw Error('Demo must not call an API');};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.eval(source);
 const navigate=page=>{w.history.replaceState(null,'','#'+page);w.dispatchEvent(new w.Event('hashchange'));};
 return {w,d:w.document,navigate};
}
test('demo is isolated from operational scripts, API connections and form submission',t=>{
 const {d,navigate}=mount(t);
 assert.match(d.querySelector('meta[http-equiv="Content-Security-Policy"]').content,/connect-src 'none'/);
 assert.match(d.querySelector('meta[http-equiv="Content-Security-Policy"]').content,/form-action 'none'/);
 assert.deepEqual([...d.scripts].map(s=>s.getAttribute('src')),['/client-demo/demo.js']);
 for(const page of ['home','catalog','casino','referral','guide','contact']){
  navigate(page);assert.equal(d.querySelectorAll('iframe,video,form').length,0);
  assert.equal(d.querySelector('[aria-current=page]').dataset.page,page);
  for(const a of d.querySelectorAll('a'))assert.ok(a.getAttribute('href').startsWith('#'));
 }
 assert.equal(d.querySelector('.navigation a:last-child').dataset.page,'contact');
 navigate('referral');d.querySelector('.skip').click();assert.equal(d.activeElement.id,'main');
 assert.equal(d.querySelector('[aria-current=page]').dataset.page,'referral');
});
test('studio filter, preview and reset operate entirely on sample data',t=>{
 const {d,navigate}=mount(t);navigate('casino');
 assert.equal(d.querySelectorAll('[data-preview]').length,3);
 d.querySelector('[data-filter=B]').click();assert.equal(d.querySelectorAll('[data-preview]').length,1);
 d.querySelector('[data-preview=B]').click();assert.equal(d.querySelector('#preview').open,true);
 assert.match(d.querySelector('#dialog-title').textContent,/Sapphire/);
 d.querySelector('#close-preview').click();assert.equal(d.querySelector('#preview').open,false);
 d.querySelector('#reset').click();navigate('casino');assert.equal(d.querySelectorAll('[data-preview]').length,3);
});
test('referral periods change synthetic rows and clipboard only receives an inactive example',async t=>{
 const {w,d,navigate}=mount(t);let copied='';
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async v=>{copied=v;}}});
 navigate('referral');assert.equal(d.querySelectorAll('tbody tr').length,3);
 d.querySelector('[data-period=weekly]').click();assert.equal(d.querySelectorAll('tbody tr').length,5);
 d.querySelector('[data-period=monthly]').click();assert.equal(d.querySelectorAll('tbody tr').length,6);
 d.querySelector('#copy-code').click();await Promise.resolve();assert.equal(copied,'DEMO-PREVIEW-ONLY');
 navigate('contact');d.querySelector('#chat-preview').click();assert.match(d.querySelector('#dialog-title').textContent,/Chatvice/);
 assert.equal(d.querySelectorAll('form,textarea,input').length,0);
 navigate('unknown');assert.equal(w.location.hash,'#home');
});
