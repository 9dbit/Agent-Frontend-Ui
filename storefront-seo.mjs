import {fetchGenesisContent} from './genesis-content-proxy.mjs';
import {mergeGenesisContent} from './public/genesis-content.js';
import {publishedPage} from './public/content-routes.js';
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function injectSEO(html,manifest,url){
 const c=publishedPage(manifest,new URL(url).pathname);if(!c)return html;
 const canonical=c.canonical||url;
 html=html.replace(/<meta\s+name=["']robots["'][^>]*>/gi,'').replace(/<link\s+rel=["']canonical["'][^>]*>/gi,'');
 html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(c.title||'64COR')+'</title>').replace(/<meta\s+name=["']description["'][^>]*>/i,'');
 return html.replace('</head>',`<meta name="description" content="${esc(c.description)}"><meta name="robots" content="${manifest.tenant?.environment==='sandbox'?'noindex, nofollow':esc(c.robots||'index, follow')}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:title" content="${esc(c.title)}"><meta property="og:description" content="${esc(c.description)}"></head>`);
}
export async function homeSEO(data,req){
 if(!process.env.PLAYGROUND_API_ORIGIN&&req.headers.host!=='playground-agent-frontend-production.up.railway.app')return data;
 try{
  const origin=process.env.PLAYGROUND_API_ORIGIN||'https://playground-agent-sandbox-production.up.railway.app';
  const r=await fetch(new URL('/api/storefront/64cor',origin),{signal:AbortSignal.timeout(5000)});if(!r.ok)return data;
  let manifest=await r.json();try{manifest=mergeGenesisContent(manifest,{banners:[],promotions:[]},await fetchGenesisContent(),new URL(req.url,'https://local').pathname==='/en'?'en':'id').manifest;}catch{}
  return Buffer.from(injectSEO(data.toString(),manifest,new URL(req.url,'https://playground-agent-frontend-production.up.railway.app').href));
 }catch{return data;}
}

