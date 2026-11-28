import {test} from 'node:test';import assert from 'node:assert/strict';import {discovery} from '../storefront-discovery.mjs';
test('discovery lists only published public routes, escapes XML and suppresses sandbox/maintenance indexing',()=>{
 const m={tenant:{environment:'live'},settings:{},pages:[{slug:'home'},{slug:'privacy-policy'},{slug:'banner-01'},{slug:'promo-01',canonical:'https://evil.example/path'},{slug:'about-us',robots:'noindex, nofollow'}]};
 const d=discovery(m,'https://64cor.example');assert.match(d.sitemap,/<loc>https:\/\/64cor.example\/legal\/privacy-policy<\/loc>/);assert.doesNotMatch(d.sitemap,/evil|banner|about-us/);assert.match(d.robots,/Disallow: \/user/);
 for(const gated of [{...m,tenant:{environment:'sandbox'}},{...m,settings:{maintenance:true}}]){const result=discovery(gated,'https://64cor.example');assert.match(result.robots,/Disallow: \/\n/);assert.doesNotMatch(result.sitemap,/<url>/);}
});
