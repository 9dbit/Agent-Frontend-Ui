import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.woff2':'font/woff2'};
export const server = http.createServer(async (req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  if(req.method!=='GET'&&req.method!=='HEAD'){ res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Read-only frontend');return; }
  let name;
  try{name=decodeURIComponent(new URL(req.url,'http://local').pathname);}catch{res.writeHead(400);res.end();return;}
  if(name==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',mode:'frontend-demo',version:'1.0.0'}));return;}
  let target=path.resolve(root,'.'+name);
  if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return;}
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}catch{
    if(path.extname(name)||name.startsWith('/assets/')||name.startsWith('/api/')){res.writeHead(404);res.end('Not found');return;}
    target=path.join(root,'index.html');
  }
  try { const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':name.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data); }
  catch{res.writeHead(404);res.end('Not found');}
});
if(process.argv[1]===fileURLToPath(import.meta.url)){server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Frontend ready'));}
