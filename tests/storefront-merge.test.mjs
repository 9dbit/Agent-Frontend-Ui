import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const catalog=JSON.parse(readFileSync('public/data.json','utf8'));
const script=readFileSync('public/playground.js','utf8').replace(/^export /gm,'')+'\n globalThis.testConnect=connect;';

function setup(games){
 const manifest={games,pages:[],capabilities:{}};
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
 const data={games:[...catalog.games],providers:[...catalog.providers],promotions:[],banners:[],sports:[],exclusive:[]};
 const connect=setup(originals.slice(0,3).map((g,i)=>({
  id:'backend-'+i,name:g.title,slug:'registered-'+i,readiness:'ready',status:'published'
 })));
 await connect(data);
 const after=data.games.filter(g=>g.provider==='soft-tech');
 assert.deepEqual(Array.from(after,g=>g.title),Array.from(originals,g=>g.title));
 assert.equal(after.length,6);
 for(const g of after.slice(0,3))assert.ok(g.backendId);
 for(const g of after.slice(3))assert.equal(g.backendId,undefined);
 assert.equal(after.find(g=>g.title==='Empire of Atlantis').comingSoon,true);
 assert.equal(after.find(g=>g.title==='Empire of Atlantis').launchUrl,undefined);
 assert.equal(after.find(g=>g.title==='Gachamon').staging,true);
});

test('an empty storefront does not erase XD Play card thumbnails',async()=>{
 const data={games:[...catalog.games],providers:[],promotions:[],banners:[],sports:[],exclusive:[]};
 await setup([])(data);
 assert.equal(data.games.filter(g=>g.provider==='soft-tech').length,6);
});

test('additional registered titles are still preserved without hiding local originals',async()=>{
 const data={games:[...catalog.games],providers:[],promotions:[],banners:[],sports:[],exclusive:[]};
 await setup([{id:'additional-id',slug:'additional-game',name:'Newly registered game',status:'published'}])(data);
 assert.equal(data.games.length,7);
 assert.ok(data.games.some(g=>g.backendId==='additional-id'));
});
