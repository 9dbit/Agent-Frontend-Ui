import {infoSlugs} from './public/content-routes.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function discovery(manifest,origin){
 const base=new URL(origin).origin, sandbox=manifest.tenant?.environment!=='live'||manifest.settings?.maintenance;
 const rows=manifest.pages.filter(p=>p.robots!=='noindex, nofollow').flatMap(p=>{
   const route=p.slug==='home'?'/':Object.entries(infoSlugs).find(([,slug])=>slug===p.slug)?.[0]||(p.slug.startsWith('promo-')?'/promotions/all/'+p.slug:null);
   if(!route)return [];let canonical=new URL(route,base);if(p.canonical){const u=new URL(p.canonical);if(u.origin===base)canonical=u;}return [canonical.href];
 });
 return {robots:sandbox?'User-agent: *\nDisallow: /\n':`User-agent: *\nDisallow: /api/\nDisallow: /user\nDisallow: /deposit\nDisallow: /withdraw\nDisallow: /login\nDisallow: /register\nSitemap: ${base}/sitemap.xml\n`,sitemap:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sandbox?'':[...new Set(rows)].map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`};
}
export async function serveDiscovery(req,res){
 const path=new URL(req.url,'http://local').pathname;if(!['/robots.txt','/sitemap.xml'].includes(path))return false;
 try{
  const upstream=process.env.PLAYGROUND_API_ORIGIN||'https://playground-agent-sandbox-production.up.railway.app';
  const r=await fetch(new URL('/api/storefront/64cor',upstream),{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Manifest unavailable');
  const d=discovery(await r.json(),process.env.STOREFRONT_PUBLIC_ORIGIN||'https://playground-agent-frontend-production.up.railway.app');
  res.writeHead(200,{'Content-Type':path==='/robots.txt'?'text/plain; charset=utf-8':'application/xml; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:path==='/robots.txt'?d.robots:d.sitemap);
 }catch{res.writeHead(503,{'Content-Type':'text/plain','Retry-After':'60','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:'Website configuration unavailable');}return true;
}
