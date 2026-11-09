import {mergeGenesisContent,loadGenesisContent} from './genesis-content.js';
let csrf='';
let genesisBase=null,genesisFeed=null;
export function applyGenesisLocale(data,language='id'){if(!genesisBase)return;const merged=mergeGenesisContent(genesisBase.manifest,genesisBase.data,genesisFeed,language);manifest.pages=merged.manifest.pages;data.banners=merged.data.banners;data.promotions=merged.data.promotions;}
export let manifest,actor=null;
let device=localStorage.getItem('64cor.device');if(!device){device=crypto.randomUUID();localStorage.setItem('64cor.device',device);}
export async function api(path,method='GET',body){
 const r=await fetch('/api/player'+path,{method,credentials:'same-origin',cache:'no-store',headers:{'X-Device-ID':device,...(csrf?{'X-CSRF-Token':csrf}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();if(!r.ok){const e=Error(data.error||'Request gagal');e.status=r.status;throw e;}return data;
}
export function clearSession(){actor=null;csrf='';}
export async function session(){try{actor=await api('/me');csrf=actor.csrf;return actor;}catch(e){clearSession();if(e.status!==401)throw e;return null;}}
export async function authenticate(mode,p){actor=await api('/auth/'+mode,'POST',p);csrf=actor.csrf;return actor;}
const assetURL=value=>String(value||'').replace(/^https:\/\/playground-agent-frontend-production\.up\.railway\.app(?=\/)/,'');
export async function connect(data){
 const r=await fetch('/api/storefront',{cache:'no-store'});if(!r.ok)throw Error('Konfigurasi Playground belum tersedia');
 manifest=await r.json();const pages=manifest.pages;let home=pages.find(x=>x.slug==='home')||{};
 data.banners=pages.filter(x=>x.slug==='home'||x.slug.startsWith('banner-')).sort((a,b)=>a.slug==='home'?-1:b.slug==='home'?1:a.slug.localeCompare(b.slug)).filter(x=>x.banner_url).map(x=>({id:(x.banner_url.includes('/soft-tech/')?'soft-tech-':'')+x.slug,image:assetURL(x.banner_url),title:x.title,path:x.link_url||'/'}));
 const templates=data.games.filter(x=>x.provider==='soft-tech');
 data.games=manifest.games.map(g=>{
   const t=templates.find(t=>t.title.toLowerCase()===g.name.toLowerCase());
   return {...t,id:t?.id||g.slug,title:g.name,provider:'soft-tech',providerName:'Soft Tech',family:t?.family||'slot',image:t?.image||'/assets/soft-tech/soft-tech-originals-hero-v1.webp',backendId:g.id,readiness:g.readiness,status:g.status};
 });
 data.providers=data.providers.filter(p=>data.games.some(g=>g.provider===p.id));
 data.promotions=pages.filter(p=>p.slug.startsWith('promo-')).map(p=>({id:p.slug,title:p.title,image:assetURL(p.banner_url),coverImage:assetURL(p.banner_url),banner:assetURL(p.banner_url),category:'all',period:'Informasi agen',summary:p.description,terms:(p.body||'').split('\n')}));
 data.sports=[];data.exclusive=[];
 genesisBase={manifest:structuredClone(manifest),data:{banners:structuredClone(data.banners),promotions:structuredClone(data.promotions)}};
 try{genesisFeed=await loadGenesisContent();applyGenesisLocale(data,location.pathname==='/en'?'en':'id');home=manifest.pages.find(x=>x.slug==='home')||home;}catch{document.documentElement.dataset.genesisCms='unavailable';}
 return {home,manifest};
}
export async function accountState(){
 const a=await session();if(!a)return {signedIn:false,balance:0,user:{name:'',email:''},transactions:[],messages:[],activity:[],favorites:[],rounds:[],rewards:[],referral:null,leaderboard:null};
 const [w,rounds,tickets,inbox,activity,rewards,referral,leaderboard]=await Promise.all([api('/wallet'),api('/rounds'),api('/tickets'),api('/inbox'),api('/activity'),api('/rewards'),manifest.capabilities.referral?api('/referral'):null,manifest.capabilities.leaderboard?api('/leaderboard'):null]);
 return {signedIn:true,balance:w.balances.find(x=>x.code.endsWith(':available'))?.amount||'0',reserved:w.balances.find(x=>x.code.endsWith(':reserved'))?.amount||'0',user:{name:a.display_name,email:a.profile?.email||'',email_verified:!!a.profile?.email_verified},favorites:a.profile?.favorites||[],
 transactions:w.transactions.map(t=>({...t,type:t.kind,status:['credited','paid'].includes(t.state)?'completed':['cancelled','failed','expired'].includes(t.state)?'cancelled':'pending',createdAt:t.created_at})),
 messages:[...inbox.items.map(m=>({id:m.id,title:m.title,text:m.body,read:!!m.read_at,source:'inbox'})),...tickets.items.map(t=>({id:t.id,title:t.subject,text:t.messages.map(m=>m.body).join('\n\n'),read:(a.profile?.read_messages||[]).includes(t.id)}))],activity:activity.items.map(a=>({id:a.id,text:({'player.registered':'Registrasi akun','auth.login':'Masuk akun','player.profile_updated':'Profil diperbarui','player.password_changed':'Password diperbarui','account.password_recovered':'Password dipulihkan','reward.claimed':'Bonus diklaim'})[a.action]||a.action,time:a.created_at})),rounds:rounds.items,rewards:rewards.items,referral,leaderboard};
}

