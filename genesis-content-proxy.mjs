export async function fetchGenesisContent(fetcher=fetch){
 const origin=process.env.GENESIS_CONTENT_ORIGIN,tenant=process.env.GENESIS_CONTENT_TENANT||'64cor';if(!origin)return null;
 if(!/^[a-z0-9-]{3,64}$/.test(tenant))throw Error('Invalid Genesis tenant');const url=new URL('/api/public/content/'+tenant,origin);if(url.protocol!=='https:'&&url.hostname!=='127.0.0.1')throw Error('Genesis origin requires HTTPS');
 const r=await fetcher(url,{signal:AbortSignal.timeout(5000),redirect:'error'});if(!r.ok)throw Error('Genesis feed unavailable');const bytes=await r.text();if(bytes.length>2000000)throw Error('Feed exceeds limit');const data=JSON.parse(bytes);if(data.tenant_id!==tenant||!Array.isArray(data.items))throw Error('Invalid feed');return data;
}
export async function genesisContentProxy(req,res){
 if(new URL(req.url,'http://local').pathname!=='/api/genesis-content')return false;
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.writeHead(405,{Allow:'GET'});res.end('{}');return true;}
 try{const feed=await fetchGenesisContent();res.end(JSON.stringify(feed||{enabled:false,items:[]}));}catch{res.writeHead(502);res.end(JSON.stringify({error:'Konten agen sementara tidak tersedia'}));}return true;
}
