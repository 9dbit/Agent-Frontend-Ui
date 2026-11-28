import {injectSEO} from '../storefront-seo.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
test('published CMS metadata is rendered and escaped in initial HTML',()=>{const out=injectSEO('<html><head><title>old</title><meta name="description" content="old"></head></html>',{tenant:{environment:'sandbox'},pages:[{slug:'home',title:'64COR <new>',description:'" test',canonical:'https://example.test/'}]},'https://example.test/');assert.match(out,/<title>64COR &lt;new&gt;<\/title>/);assert.match(out,/noindex, nofollow/);assert.match(out,/content="&quot; test"/);assert.equal((out.match(/name="description"/g)||[]).length,1);});

test('deep-page metadata uses its own published content and does not reuse the home canonical',()=>{
 const manifest={tenant:{environment:'sandbox'},pages:[{slug:'home',title:'Home',canonical:'https://example.test/'},{slug:'privacy-policy',title:'Privacy',description:'Published privacy'}]};
 const html='<html><head><title>old</title><meta name="robots" content="index"><link rel="canonical" href="https://old.test"></head></html>';
 const out=injectSEO(html,manifest,'https://example.test/legal/privacy-policy');
 assert.match(out,/<title>Privacy<\/title>/);assert.match(out,/href="https:\/\/example.test\/legal\/privacy-policy"/);assert.equal((out.match(/name="robots"/g)||[]).length,1);assert.equal((out.match(/rel="canonical"/g)||[]).length,1);
});
