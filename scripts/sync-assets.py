import concurrent.futures, hashlib, json, pathlib, subprocess, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/reference/gobi88-asset-inventory.json'
OUT = ROOT / 'public/assets'
OUT.mkdir(parents=True, exist_ok=True)
entries = json.loads(SOURCE.read_text())['assets']

def acquire(item):
    url = item['url']
    ext = pathlib.Path(urllib.parse.urlparse(url).path).suffix.lower()
    path = OUT / (hashlib.sha256(url.encode()).hexdigest()[:16] + ext)
    if not path.exists():
        result = subprocess.run(['curl','--fail','--location','--silent','--show-error','--max-time','35','--retry','1',url,'-o',str(path)], capture_output=True, text=True)
        if result.returncode:
            path.unlink(missing_ok=True)
            return {**item, 'status':'FAILED', 'error':result.stderr[-250:]}
    data = path.read_bytes()
    if not data or data.lstrip().lower().startswith(b'<!doctype html'):
        path.unlink(missing_ok=True)
        return {**item, 'status':'FAILED','error':'empty or HTML response'}
    return {**item, 'status':'COPIED', 'localPath':'/assets/'+path.name, 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest()}

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    results=list(pool.map(acquire, entries))
manifest={'source':'https://gobi88.com/','capturedAt':'2026-11-03','assets':results}
(ROOT/'docs/reference/asset-copy-manifest.json').write_text(json.dumps(manifest,indent=2))
(ROOT/'public/asset-map.json').write_text(json.dumps({a['url']:a['localPath'] for a in results if a['status']=='COPIED'},indent=2))
print(json.dumps({'copied':sum(a['status']=='COPIED' for a in results),'failed':[a for a in results if a['status']=='FAILED'],'bytes':sum(a.get('bytes',0) for a in results)}))
