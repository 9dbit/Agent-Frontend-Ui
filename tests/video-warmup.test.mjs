import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const script=readFileSync('public/video-warmup.js','utf8');
const originals=JSON.parse(readFileSync('public/data.json','utf8')).games.filter(g=>g.provider==='soft-tech');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

function setup(t,fetcher){
  const dom=new JSDOM('<main>Homepage</main>',{url:'https://example.test/',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window,requests=[],loads=[];
  w.fetch=(url,options)=>{requests.push({url,options});return fetcher(url)};
  w.URL.createObjectURL=blob=>'blob:https://example.test/'+blob.path;
  w.HTMLMediaElement.prototype.load=function(){loads.push(this)};
  w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
  w.eval(script);
  const showDetail=path=>{
    w.document.querySelector('main').innerHTML=`<video class="original-video" autoplay muted loop playsinline><source src="${path}" type="video/mp4"></video>`;
    return w.document.querySelector('video');
  };
  return {w,requests,loads,showDetail};
}

test('all hero downloads start on homepage and completed media is reused on repeated detail navigation',async t=>{
  const ui=setup(t,async path=>({ok:true,blob:async()=>({path})}));
  assert.equal(ui.w.document.querySelector('video'),null);
  assert.deepEqual(ui.requests.map(r=>r.url),originals.map(g=>g.video));
  assert.ok(ui.requests.every(r=>r.options.cache==='force-cache'));
  await tick();
  for(const game of [originals[0],originals[1],originals[0]]){
    const video=ui.showDetail(game.video);
    await tick();
    assert.equal(video.querySelector('source').src,'blob:https://example.test/'+game.video);
    assert.equal(video.muted,true);
  }
  assert.equal(ui.requests.length,3,'Navigation must not fetch the files again');
  assert.equal(ui.loads.length,3,'Each new hero attaches the warmed media once');
});

test('an unfinished download can attach later while a failed warmup preserves the direct URL',async t=>{
  let finish;
  const uno=originals[0].video;
  const ui=setup(t,path=>path===uno?new Promise(resolve=>finish=resolve):Promise.reject(new Error('offline')));
  const video=ui.showDetail(uno);
  await tick();
  assert.equal(video.querySelector('source').getAttribute('src'),uno);
  finish({ok:true,blob:async()=>({path:uno})});
  await tick();
  assert.match(video.querySelector('source').src,/^blob:/);
  const failed=ui.showDetail(originals[1].video);
  await tick();
  assert.equal(failed.querySelector('source').getAttribute('src'),originals[1].video);
});
