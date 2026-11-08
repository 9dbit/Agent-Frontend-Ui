import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const data=JSON.parse(readFileSync('public/data.json','utf8')),manifest=JSON.parse(readFileSync('docs/reference/asset-copy-manifest.json','utf8'));
for(const n of ['public/pixel-icons.js','public/app.js','public/state.js','public/config.js','public/video-warmup.js','public/preview/preview.js','server.mjs','storefront-proxy.mjs','storefront-seo.mjs','public/playground.js'])execFileSync(process.execPath,['--check',n]);
let refs=0;function walk(v){if(typeof v==='string'&&v.startsWith('/assets/')){refs++;if(!existsSync('public'+v))throw new Error('Missing asset '+v);}else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk);}walk(data);
for(const match of readFileSync('public/liquid.css','utf8').matchAll(/url\(['"]?(\/assets\/[^'"\s)]+)['"]?\)/g))walk(match[1]);
if(manifest.assets.some(a=>a.status!=='COPIED'))throw new Error('Uncopied reference assets');
if(readFileSync('public/app.js','utf8').includes('https://gobi88.com'))throw new Error('Source endpoint in app');
console.log(JSON.stringify({syntax:'pass',localAssetReferences:refs,copiedAssets:manifest.assets.length,games:data.games.length,providers:data.providers.length,mode:'playground-connected'}));
