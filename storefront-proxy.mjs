const DEFAULT_UPSTREAM='https://playground-agent-sandbox-production.up.railway.app';
const playerRoutes=new Set(['GET /me','GET /wallet','GET /rounds','GET /tickets','GET /games','POST /auth/login','POST /auth/register','POST /auth/logout','POST /auth/password','POST /deposits','POST /withdrawals','POST /tickets','POST /launch','PUT /profile','PUT /preferences']);
export async function proxy(req,res) {
 const path=new URL(req.url,'http://local').pathname;
 const media=/^\/media\/agency\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(path);
 if(!path.startsWith('/api/')&&!media)return false;
 const route=path.replace(/^\/api\/player/,'');
 const allowed=path==='/api/storefront'&&req.method==='GET'||media&&req.method==='GET'||path.startsWith('/api/player/')&&(playerRoutes.has(req.method+' '+route)||req.method==='POST'&&/^\/withdrawals\/[a-f0-9-]{36}\/cancel$/.test(route));
 const json=(status,error)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error}));};
 if(!allowed){json(404,'Endpoint tidak tersedia');return true;}
 if(!['GET','HEAD'].includes(req.method)) {
   let origin;try{origin=req.headers.origin&&new URL(req.headers.origin);}catch{json(403,'Origin tidak valid');return true;}
   if(req.headers['sec-fetch-site']==='cross-site'||!origin||origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol)){json(403,'Cross-site request rejected');return true;}
   if(!String(req.headers['content-type']).startsWith('application/json')){json(415,'JSON required');return true;}
 }
 try {
   const upstream=new URL(process.env.PLAYGROUND_API_ORIGIN||DEFAULT_UPSTREAM);
   const target=new URL(path==='/api/storefront'?'/api/storefront/64cor':path,upstream);
   const headers={'X-Playground-Tenant':'64cor','Origin':upstream.origin,'User-Agent':String(req.headers['user-agent']||'64COR').slice(0,300)};
   const cookie=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>/^agency_player=[A-Za-z0-9_-]{43}$/.test(x));if(cookie)headers.Cookie=cookie;
   for(const k of ['x-csrf-token','x-device-id'])if(req.headers[k])headers[k]=String(req.headers[k]).slice(0,150);
   headers['X-Forwarded-For']=String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',').at(-1).trim();
   let body;
   if(!['GET','HEAD'].includes(req.method)) {
     let size=0;const chunks=[];for await (const c of req){size+=c.length;if(size>32000){json(413,'Request terlalu besar');return true;}chunks.push(c);}
     const p=JSON.parse(Buffer.concat(chunks).toString());
     if(route==='/auth/login'||route==='/auth/register')p.tenant='64cor';
     body=JSON.stringify(p);headers['Content-Type']='application/json';
   }
   const r=await fetch(target,{method:req.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000)});
   if(r.status>=300&&r.status<400)throw Error('Unexpected redirect');
   const responseHeaders={'Content-Type':r.headers.get('content-type')||'application/json','Cache-Control':'no-store'};
   const cookies=r.headers.getSetCookie().filter(x=>x.startsWith('agency_player='));if(cookies.length)responseHeaders['Set-Cookie']=cookies;
   res.writeHead(r.status,responseHeaders);res.end(Buffer.from(await r.arrayBuffer()));
 }catch(e){if(res.headersSent){res.end();return true;}json(e instanceof SyntaxError?400:502,e instanceof SyntaxError?'JSON tidak valid':'Playground sedang tidak tersedia. Coba kembali.');}
 return true;
}
