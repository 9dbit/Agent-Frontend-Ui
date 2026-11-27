import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const catalog=JSON.parse(readFileSync('public/data.json','utf8'));
const script=readFileSync('public/playground.js','utf8').replace(/^export /gm,'')+'\n globalThis.testConnect=connect;';

function setup(games,pages=[]){
 const manifest={games,pages,capabilities:{}};
 const sandbox={
  localStorage:{getItem:()=>null,setItem:()=>{}},
  crypto:{randomUUID:()=> 'test-device'},
  fetch:async url=>{
   assert.equal(url,'/api/storefront');
   return {ok:true,json:async()=>manifest};
  }
 };
 runInNewContext(script,sandbox);
 return sandbox.testConnect;
}

test('connected 64COR retains six XD Play cards even when storefront registers only three',async()=>{
 const originals=catalog.games.filter(g=>g.provider==='soft-tech');
 assert.equal(originals.length,6);
 const data={games:[...catalog.games],providers:[...catalog.providers],promotions:[],banners:[...catalog.banners],sports:[],exclusive:[]};
 const connect=setup(originals.slice(0,3).map((g,i)=>({
  id:'backend-'+i,name:g.title,slug:'registered-'+i,readiness:'ready',status:'published'
 })));
 await connect(data);
 const after=data.games.filter(g=>g.provider==='soft-tech');
 assert.deepEqual(Array.from(after,g=>g.title),Array.from(originals,g=>g.title));
 assert.equal(after.length,6);
 const atlantis=after.find(g=>g.title==='Empire of Atlantis');
 assert.equal(atlantis.image,'/assets/xd-play/empire-of-atlantis-gold-border.webp');
 assert.equal(atlantis.hero,'/assets/xd-play/empire-of-atlantis-hero-3x1.webp');
 assert.equal(atlantis.heroAspect,'wide');
 assert.equal(data.banners[0].id,'soft-tech-empire-of-atlantis');
 assert.equal(data.banners[0].image,'/assets/xd-play/empire-of-atlantis-hero-3x1.webp');
 for(const g of after.slice(0,3))assert.ok(g.backendId);
 for(const g of after.slice(3))assert.equal(g.backendId,undefined);
 assert.equal(after.find(g=>g.title==='Empire of Atlantis').comingSoon,true);
 assert.equal(after.find(g=>g.title==='Empire of Atlantis').launchUrl,undefined);
 assert.equal(after.find(g=>g.title==='Gachamon').staging,true);
});

test('an empty storefront does not erase XD Play card thumbnails',async()=>{
 const data={games:[...catalog.games],providers:[],promotions:[],banners:[...catalog.banners],sports:[],exclusive:[]};
 await setup([])(data);
 assert.equal(data.games.filter(g=>g.provider==='soft-tech').length,6);
});

test('additional registered titles are still preserved without hiding local originals',async()=>{
 const data={games:[...catalog.games],providers:[],promotions:[],banners:[...catalog.banners],sports:[],exclusive:[]};
 await setup([{id:'additional-id',slug:'additional-game',name:'Newly registered game',status:'published'}])(data);
 assert.equal(data.games.length,7);
 assert.ok(data.games.some(g=>g.backendId==='additional-id'));
});

test('Atlantis hero stays first while published banners remain without duplicates',async()=>{
 const data={games:[...catalog.games],providers:[],promotions:[],banners:[...catalog.banners],sports:[],exclusive:[]};
 const pages=[
  {slug:'home',title:'64COR Home',banner_url:'/assets/remote-home.webp',link_url:'/'},
  {slug:'banner-atlantis',title:'Empire of Atlantis',banner_url:'/assets/remote-atlantis.webp',link_url:'/play/originals/xdplay-empire-of-atlantis'},
  {slug:'banner-other',title:'Another game',banner_url:'/assets/remote-other.webp',link_url:'/games/other'}
 ];
 await setup([],pages)(data);
 assert.equal(data.banners[0].image,'/assets/xd-play/empire-of-atlantis-hero-3x1.webp');
 assert.equal(data.banners.filter(b=>b.path==='/play/originals/xdplay-empire-of-atlantis').length,1);
 assert.ok(data.banners.some(b=>b.image==='/assets/remote-home.webp'));
 assert.ok(data.banners.some(b=>b.image==='/assets/remote-other.webp'));
});
