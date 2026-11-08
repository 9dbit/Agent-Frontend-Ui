const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function injectSEO(html,manifest,url){
 const c=manifest.pages?.find(x=>x.slug==='home');if(!c)return html;
 const canonical=c.canonical||url;
 html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(c.title||'64COR')+'</title>').replace(/<meta\s+name=["']description["'][^>]*>/i,'');
 return html.replace('</head>',`<meta name="description" content="${esc(c.description)}"><meta name="robots" content="${manifest.tenant?.environment==='sandbox'?'noindex, nofollow':esc(c.robots||'index, follow')}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:title" content="${esc(c.title)}"><meta property="og:description" content="${esc(c.description)}"></head>`);
}
export async function homeSEO(data,req){
 if(!process.env.PLAYGROUND_API_ORIGIN&&req.headers.host!=='playground-agent-frontend-production.up.railway.app')return data;
 try{
  const origin=process.env.PLAYGROUND_API_ORIGIN||'https://playground-agent-sandbox-production.up.railway.app';
  const r=await fetch(new URL('/api/storefront/64cor',origin),{signal:AbortSignal.timeout(5000)});if(!r.ok)return data;
  return Buffer.from(injectSEO(data.toString(),await r.json(),'https://playground-agent-frontend-production.up.railway.app/'));
 }catch{return data;}
}
