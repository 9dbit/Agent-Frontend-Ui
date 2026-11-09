// Public content only. Player accounts, balances and games remain authoritative in Playground.
const https=v=>{try{return new URL(v).protocol==='https:'?v:'';}catch{return '';}};
const internal=v=>typeof v==='string'&&/^\/(?!\/)/.test(v)?v:'';
const route=d=>d.destination==='Internal'?internal(d.internal_target):https(d.target_url);
export function mergeGenesisContent(manifest,data,feed,language='id'){
 if(!feed||!Array.isArray(feed.items))return {manifest,data};
 const now=Date.now(),items=feed.items.filter(x=>x.data?.status==='Published'&&x.data.enabled===true&&x.data.language===language&&(!x.data.starts_at||Date.parse(x.data.starts_at)<=now)&&(!x.data.ends_at||Date.parse(x.data.ends_at)>now)).sort((a,b)=>a.data.sort_order-b.data.sort_order||a.id.localeCompare(b.id));
 const pages=manifest.pages.map(x=>({...x}));
 const update=(path,patch)=>{const index=pages.findIndex(x=>x.path===path||x.slug===(path==='/'?'home':path.replace(/^\/(legal\/)?/,'')));const old=index>=0?pages[index]:{slug:path==='/'?'home':path.replace(/^\/(legal\/)?/,''),path};const merged={...old,...patch,path,genesis:true};if(index>=0)pages[index]=merged;else pages.push(merged);};
 for(const {id,kind,data:d}of items){if(kind==='pages'&&internal(d.path))update(d.path,{title:d.title||d.name,description:'',body:d.body,genesis_page:true,source_id:id});if(kind==='studio')update('/',{title:d.headline||d.title||d.name,description:d.description||d.body,source_id:id});if(kind==='seo')update(internal(d.path)||'/',{title:d.title||d.name,description:d.description||d.body,canonical:https(d.canonical)||'',source_id:id});}
 const banners=items.filter(x=>x.kind==='banners'&&x.data.placement!=='promotion'&&https(x.data.image_url)).map(x=>({id:'genesis-'+x.id,image:x.data.image_url,title:x.data.title||x.data.name,path:route(x.data)||'/'}));
 const promotions=items.filter(x=>x.kind==='banners'&&x.data.placement==='promotion').map(x=>({id:'genesis-'+x.id,title:x.data.title||x.data.name,image:https(x.data.image_url),coverImage:https(x.data.image_url),banner:https(x.data.image_url),category:'all',period:'Informasi agen',summary:x.data.body,terms:(x.data.body||'').split('\n')}));
 for(const p of promotions)update('/promotions/all/'+p.id,{slug:p.id,title:p.title,description:p.summary,body:p.terms.join('\n'),genesis_page:false});
 return {manifest:{...manifest,pages},data:{...data,banners:banners.length?banners:data.banners,promotions:promotions.length?promotions:data.promotions}};
}
export async function loadGenesisContent(){const response=await fetch('/api/genesis-content',{cache:'no-store'});if(!response.ok)throw Error('Konten Genesis sementara tidak tersedia');return response.json();}
export function genesisNavigation(manifest){const container=document.querySelector('#main');if(!container)return;document.querySelector('#genesisPublishedNav')?.remove();const pages=manifest?.pages?.filter(p=>p.genesis_page)||[];if(!pages.length)return;const nav=document.createElement('nav');nav.id='genesisPublishedNav';nav.className='form-actions';nav.setAttribute('aria-label','Halaman agen');for(const p of pages){const a=document.createElement('a');a.href=p.path;a.dataset.route='';a.className='btn secondary small';a.textContent=p.title;nav.append(a);}container.append(nav);}
