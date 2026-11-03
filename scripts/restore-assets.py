"""Restore the captured public assets, accepting only the recorded SHA-256 bytes."""
import concurrent.futures
import hashlib
import json
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASSETS = json.loads((ROOT / 'docs/reference/asset-copy-manifest.json').read_text())['assets']

def restore(asset):
    destination = ROOT / 'public' / asset['localPath'].lstrip('/')
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and hashlib.sha256(destination.read_bytes()).hexdigest() == asset['sha256']:
        return
    temporary = destination.with_suffix(destination.suffix + '.download')
    subprocess.run(['curl', '--proto', '=https', '--fail', '--location', '--silent',
                    '--show-error', '--max-time', '60', '--retry', '2', asset['url'],
                    '-o', str(temporary)], check=True)
    if hashlib.sha256(temporary.read_bytes()).hexdigest() != asset['sha256']:
        temporary.unlink(missing_ok=True)
        raise RuntimeError('Asset checksum changed: ' + asset['localPath'])
    temporary.replace(destination)

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(restore, ASSETS))
shutil.copyfile(ROOT / 'public/assets/a7dc2846753035fb.png', ROOT / 'public/assets/logo.png')
print(f'Verified {len(ASSETS)} captured assets and the readable logo alias.')
