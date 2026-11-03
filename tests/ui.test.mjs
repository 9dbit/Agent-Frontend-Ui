import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

const read=p=>readFileSync(p,'utf8');
const data=JSON.parse(read('public/data.json'));
const script=['public/config.js','public/state.js','public/pixel-icons.js','public/app.js'].map(p=>read(p).replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
async function mount(t,initial){
  const errors=[];
  const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(read('public/index.html'),{url:'https://playground.example.test/',runScripts:'outside-only',virtualConsole:vc});
  const w=dom.window,d=w.document;
  w.fetch=async url=>{assert.equal(url,'/data.json');return {ok:true,json:async()=>structuredClone(data)}};
  w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});
  if(initial)w.localStorage.setItem('playground.frontend.v1',initial);
  t.after(()=>{dom.window.close();assert.deepEqual(errors,[])});
  await w.eval('(async()=>{'+script+'\n})()');
  const get=selector=>{const e=d.querySelector(selector);assert.ok(e,'Missing element: '+selector);return e};
  const click=selector=>get(selector).click();
  const navigate=url=>{w.history.pushState({},'',url);w.dispatchEvent(new w.PopStateEvent('popstate'))};
  const fill=(selector,value)=>{get(selector).value=value};
  const submit=selector=>get(selector).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  const state=()=>JSON.parse(w.localStorage.getItem('playground.frontend.v1'));
  return {w,d,get,click,navigate,fill,submit,state};
}

test('all 131 discovered routes render usable views without runtime errors',async t=>{
  const {navigate,get}=await mount(t);
  const routes=JSON.parse(read('docs/reference/gobi88-route-inventory.json')).routes;
  for(const r of routes){navigate(r.path);const main=get('main');assert.ok(main.textContent.length>60,r.path);assert.ok(!main.textContent.includes('Halaman tidak ditemukan'),r.path)}
});

test('carousel changes active slide and menu closes with Escape',async t=>{
  const {click,get,d,w}=await mount(t);
  assert.equal(d.querySelectorAll('.hero-slide').length,data.banners.length);
  const before=get('.hero-slide.active').getAttribute('href');
  click('[data-action="hero-dot"][data-index="3"]');
  assert.equal(get('.carousel .dot.active').getAttribute('aria-label'),'Banner 4');
  assert.notEqual(get('.hero-slide.active').getAttribute('href'),before);
  click('[data-action="drawer"]');assert.ok(get('[role="dialog"]'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(d.querySelector('[role="dialog"]'),null);
});

test('catalogue search, provider filtering and favorites update rendered results',async t=>{
  const {navigate,click,get,fill,submit,d,state,w}=await mount(t);
  navigate('/slot/category/hot');
  const first=get('.game-card [data-action="favorite"]');const gid=first.dataset.id;
  first.click();assert.ok(state().favorites.includes(gid));
  click('[data-action="filter-favorites"]');assert.equal(d.querySelectorAll('.game-card').length,1);
  click('[data-action="filter-favorites"]');
  fill('[name="q"]','unlikely-query-no-game');submit('[data-form="search"]');
  assert.match(get('main').textContent,/Tidak ada permainan/);
  navigate('/slot/category/hot');const provider=get('[data-filter-provider]');provider.value='pragmaticplay';provider.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.location.pathname,'/slot/provider/pragmaticplay');
  assert.ok(d.querySelectorAll('.game-card').length>0);
});

test('slow banner decoding preserves the visible slide and latest selection wins',async t=>{
  const {click,d,get}=await mount(t);
  let finishSecond,finishThird;
  const slides=d.querySelectorAll('.hero-slide');
  slides[1].querySelector('img').decode=()=>new Promise(resolve=>finishSecond=resolve);
  slides[2].querySelector('img').decode=()=>new Promise(resolve=>finishThird=resolve);
  click('[data-action="hero-dot"][data-index="1"]');
  assert.equal(get('.carousel .dot.active').dataset.index,'0');
  click('[data-action="hero-dot"][data-index="2"]');
  finishThird();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(get('.carousel .dot.active').dataset.index,'2');
  finishSecond();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(get('.carousel .dot.active').dataset.index,'2');
});

test('deposit completion, withdraw rejection and cancellation work through forms',async t=>{
  const {navigate,click,get,fill,submit,state}=await mount(t);
  navigate('/deposit');click('[data-action="amount"][data-amount="100000"]');submit('[data-form="transaction"]');
  assert.equal(state().transactions[0].status,'pending');assert.equal(state().balance,1250000);
  click('[data-action="settle"][data-status="completed"]');assert.equal(state().balance,1350000);
  assert.equal(state().transactions[0].status,'completed');click('[data-action="close"]');
  navigate('/withdraw/bank-transfer');fill('[name="amount"]','2000000');submit('[data-form="transaction"]');
  assert.match(get('.form-error').textContent,/tidak mencukupi/);assert.equal(state().transactions.length,1);
  fill('[name="amount"]','50000');submit('[data-form="transaction"]');assert.equal(state().balance,1300000);
  click('[data-action="settle"][data-status="cancelled"]');assert.equal(state().balance,1350000);assert.equal(state().transactions[0].status,'cancelled');
});

test('bonus and promotion claims cannot be repeated through the UI',async t=>{
  const {navigate,click,get,state}=await mount(t);
  navigate('/user/bonuses');click('[data-action="claim-bonus"][data-id="welcome"]');
  assert.equal(state().balance,1275000);assert.equal(get('[data-id="welcome"]').disabled,true);
  click('[data-action="claim-bonus"][data-id="welcome"]');assert.equal(state().balance,1275000);
  navigate('/promotions/all/'+data.promotions[0].id);click('[data-action="claim-promo"]');
  assert.equal(state().balance,1280000);assert.equal(get('[data-action="claim-promo"]').disabled,true);
});

test('landscape promotion covers preserve every listing, filter and detail destination',async t=>{
  const {navigate,get,d,click}=await mount(t);
  for(const route of ['/','/promotions/all','/promotions/all?category=slots','/promotions/all?category=sports']){
    navigate(route);
    const category=new URL(route,'https://test.local').searchParams.get('category');
    const expected=data.promotions.filter(p=>p.coverImage&&(!category||p.category===category));
    const covers=[...d.querySelectorAll('.promotion-cover')];
    assert.equal(covers.length,expected.length,route);
    for(const promo of expected){
      const cover=get('.promotion-cover[href="/promotions/all/'+promo.id+'"]');
      assert.equal(cover.querySelector('img').getAttribute('src'),promo.banner||promo.coverImage);
      assert.equal(Boolean(cover.querySelector('.promotion-composite')),!promo.banner,'Portrait-only artwork must be composed into a landscape cover, not stretched');
    }
  }
  navigate('/promotions/all');click('.promotion-cover');assert.ok(get('[data-action="claim-promo"]'));
  for(const promo of data.promotions.filter(p=>!p.coverImage)){
    navigate('/promotions/all/'+promo.id);
    assert.equal(get('.promo-detail img').getAttribute('src'),promo.banner);
    assert.equal(get('[data-action="claim-promo"]').dataset.id,promo.id);
  }
});

test('homepage refresh retains category access and footer while removing retired home sections',async t=>{
  const {get,d,click,w,navigate}=await mount(t);
  assert.deepEqual([...get('main').children].slice(0,3).map(e=>e.className),['ticker','main-nav','section home-soft-tech']);
  assert.deepEqual([...d.querySelectorAll('main .section-title span')].map(e=>e.textContent),['Soft Tech','Hot Slots','Promosi']);
  const destinations=[...d.querySelectorAll('.main-nav a')].map(a=>a.getAttribute('href'));
  assert.equal(destinations.length,12);
  assert.equal(d.querySelectorAll('.main-nav .category-icon').length,12);
  assert.equal(d.querySelectorAll('.payment-logos img').length,data.payments.length);
  assert.equal(d.querySelectorAll('.partners a').length,data.providers.length);
  assert.ok(get('.footer-about').textContent.includes('64COR'));
  for(const href of destinations){navigate('/');click('.main-nav a[href="'+href+'"]');assert.equal(w.location.pathname,href);assert.ok(!get('main').textContent.includes('Halaman tidak ditemukan'));}
});

test('floating dock persists across navigation and follows all five destinations and account subpages',async t=>{
  const {get,d,click,navigate,w}=await mount(t);
  const nav=get('.floating-nav'),lens=get('.nav-indicator');
  const items=[['/search',1],['/deposit',2],['/promotions/all',3],['/user',4],['/',0]];
  for(const [url,index] of items){
    click('.floating-nav a[href="'+url+'"]');
    assert.equal(w.location.pathname,url);
    assert.equal(get('.floating-nav'),nav,'Retain the same navigation element for smooth transitions');
    assert.equal(get('.nav-indicator'),lens);
    assert.equal(nav.style.getPropertyValue('--active-index'),String(index));
    assert.equal(nav.querySelectorAll('[aria-current="page"]').length,1);
    assert.equal(nav.querySelector('[aria-current="page"]').getAttribute('href'),url);
  }
  for(const url of ['/user/messages','/withdraw/bank-transfer','/referral']){navigate(url);assert.equal(nav.dataset.activeIndex,'4');}
  navigate('/contact');assert.equal(nav.dataset.activeIndex,'-1');assert.equal(nav.querySelectorAll('[aria-current]').length,0);
  navigate('/');w.history.replaceState({},'','/deposit');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.equal(nav.dataset.activeIndex,'2');
  assert.equal(d.querySelectorAll('.floating-nav').length,1);
});

test('compact footer groups keep their links after bank and partner content',async t=>{
  const {get,d,click}=await mount(t);
  const footer=get('.footer .container');
  assert.ok([...footer.children].indexOf(get('.partners'))<[...footer.children].indexOf(get('.footer-links')));
  const groups=[...d.querySelectorAll('.footer-group')];
  assert.equal(groups.length,4);assert.ok(groups.every(g=>!g.open));
  click('.footer-group summary');assert.equal(groups[0].open,true);
  assert.equal(groups[0].querySelectorAll('a').length,8);
  click('.footer-group a[href="/exclusive"]');assert.ok(get('h1').textContent.includes('Eksklusif'));
});

test('logout, login validation, registration and profile use local demo data',async t=>{
  const {navigate,click,get,fill,submit,state,w}=await mount(t);
  navigate('/user');click('[data-action="logout"]');navigate('/deposit');assert.match(get('main').textContent,/belum masuk/);
  click('[data-action="auth"]');fill('[name="password"]','wrong-example');submit('[data-form="auth"]');assert.match(get('.form-error').textContent,/demo1234/);
  click('[data-action="auth"][data-mode="register"]');fill('[name="username"]','qa_demo');fill('[name="email"]','qa@example.test');fill('[name="password"]','sample-password');fill('[name="confirm"]','sample-password');submit('[data-form="auth"]');
  assert.equal(state().user.name,'qa_demo');assert.equal(w.location.pathname,'/user');assert.equal(state().signedIn,true);
  assert.ok(!w.localStorage.getItem('playground.frontend.v1').includes('sample-password'));
  fill('[name="name"]','qa_updated');submit('[data-form="profile"]');assert.equal(state().user.name,'qa_updated');
});

test('support tickets, unread inbox and demo chat respond to user input',async t=>{
  const {navigate,click,get,fill,submit,state,d}=await mount(t);
  navigate('/complaint');fill('[name="subject"]','Test support');fill('[name="message"]','Please help with this demo form.');submit('[data-form="support"]');
  assert.match(get('[role="dialog"]').textContent,/Tiket Demo Tersimpan/);assert.equal(state().messages[0].read,false);
  click('[data-action="close"]');navigate('/user/messages');click('[data-action="message"]');assert.equal(state().messages[0].read,true);
  click('[data-action="close"]');click('[data-action="chat"]');fill('[name="message"]','How does deposit work?');submit('[data-form="chat"]');
  assert.equal(d.querySelectorAll('.chat-bubble').length,3);assert.match(get('.chat-messages').textContent,/Simulasikan selesai/);
});

test('game preview records history and state survives a new document',async t=>{
  const ui=await mount(t),game=data.games[0];ui.navigate('/play/'+game.family+'/'+game.id);ui.click('[data-action="launch-demo"]');
  assert.match(ui.get('[role="dialog"]').textContent,/Sesi preview siap/);
  ui.click('[data-action="close"]');ui.navigate('/user/history');assert.ok(ui.get('main').textContent.includes(game.title));
  const second=await mount(t,ui.w.localStorage.getItem('playground.frontend.v1'));second.navigate('/user/history');assert.ok(second.get('main').textContent.includes(game.title));
});


test('Soft Tech originals share working hero, search and detail routes with source game links',async t=>{
 const {get,d,click,navigate}=await mount(t);
 const originals=data.games.filter(g=>g.provider==='soft-tech');
 assert.equal(originals.length,3);
 assert.equal(d.querySelectorAll('.soft-tech-card').length,3);
 assert.equal(get('.header .logo').getAttribute('aria-label'),'64COR');
 for(const g of originals){
  navigate('/');click('.soft-tech-card[href="/play/originals/'+g.id+'"]');
  assert.equal(get('h1').textContent,g.title);
  assert.equal(get('.original-copy a[target="_blank"]').href,g.launchUrl);
  assert.equal(get('.original-hero').getAttribute('src'),g.hero);
  navigate('/search?q='+encodeURIComponent(g.title));
  assert.ok(get('.game-card a[href="/play/originals/'+g.id+'"]'));
 }
});

test('continue playing tracks launches, survives reload, resumes and persists dismissal',async t=>{
 const ui=await mount(t),game=data.games[0],next=data.games[1];
 assert.equal(ui.d.querySelector('.continue-card'),null);
 ui.navigate('/play/'+game.family+'/'+game.id);
 assert.equal(ui.d.querySelector('.continue-card'),null,'Opening details is not a play event');
 ui.click('[data-action="launch-demo"]');ui.click('[data-action="close"]');ui.navigate('/');
 assert.equal(ui.state().lastPlayed.gameId,game.id);
 assert.equal(ui.get('.continue-copy strong').textContent,game.title);
 const reload=await mount(t,ui.w.localStorage.getItem('playground.frontend.v1'));
 assert.equal(reload.get('.continue-provider').textContent,game.providerName);
 reload.click('[data-action="resume-game"]');assert.match(reload.get('[role="dialog"]').textContent,/Sesi preview siap/);
 reload.click('[data-action="close"]');reload.click('[data-action="dismiss-continue"]');
 assert.equal(reload.d.querySelector('.continue-card'),null);
 const dismissed=await mount(t,reload.w.localStorage.getItem('playground.frontend.v1'));
 assert.equal(dismissed.d.querySelector('.continue-card'),null);
 dismissed.navigate('/play/'+next.family+'/'+next.id);dismissed.click('[data-action="launch-demo"]');
 assert.equal(dismissed.get('.continue-copy strong').textContent,next.title);
 assert.equal(dismissed.state().lastPlayed.dismissed,false);
});

test('original game launch remembers the correct game and preserves its external resume target',async t=>{
 const ui=await mount(t),game=data.games.find(g=>g.id==='soft-tech-uno-luck');
 ui.navigate('/play/originals/'+game.id);
 ui.click('.original-copy [data-original-play]');
 assert.equal(ui.state().lastPlayed.gameId,game.id);
 const play=ui.get('.continue-play');assert.equal(play.href,game.launchUrl);assert.equal(play.target,'_blank');
 ui.click('.continue-play');assert.equal(ui.get('.continue-play'),play,'Keep the activated external link connected for native navigation');
 ui.navigate('/');assert.equal(ui.get('.continue-copy strong').textContent,game.title);
 ui.click('[data-action="dismiss-continue"]');ui.navigate('/play/originals/'+game.id);ui.click('[data-original-play]');
 assert.ok(ui.get('.continue-card'));
});

test('unknown remembered games are hidden and account pages expose every destination without duplicate breadcrumbs',async t=>{
 const ui=await mount(t,JSON.stringify({version:1,lastPlayed:{gameId:'removed-game',playedAt:'2026-11-04T00:00:00Z',dismissed:false}}));
 assert.equal(ui.d.querySelector('.continue-card'),null);
 for(const url of ['/','/search','/deposit','/user','/promotions/all']){
  ui.navigate(url);assert.equal(ui.d.querySelector('.breadcrumbs'),null);assert.equal(ui.d.querySelector('.header-profile'),null);
  if(['/deposit','/user'].includes(url))assert.equal(ui.d.querySelectorAll('.account-sidebar .account-links a').length,8);
 }
});

test('existing play history restores its last known game without overriding a dismissal',async t=>{
 const malformed=await mount(t,JSON.stringify({version:1,activity:[null,{},0]}));assert.equal(malformed.d.querySelector('.continue-card'),null);
 const game=data.games[0];
 const legacy={version:1,activity:[{id:'previous',text:'Preview game: '+game.title,time:'2026-11-04T00:00:00Z'}]};
 const ui=await mount(t,JSON.stringify(legacy));assert.equal(ui.get('.continue-copy strong').textContent,game.title);
 ui.click('[data-action="dismiss-continue"]');
 const reload=await mount(t,ui.w.localStorage.getItem('playground.frontend.v1'));assert.equal(reload.d.querySelector('.continue-card'),null);
});
