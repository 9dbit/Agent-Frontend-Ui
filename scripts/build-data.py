import json, pathlib
root=pathlib.Path(__file__).resolve().parents[1]
assets=json.loads((root/'docs/reference/asset-copy-manifest.json').read_text())['assets']
A=[{**a,'file':a['localPath']} for a in assets if a['status']=='COPIED']
route=json.loads((root/'docs/reference/gobi88-route-inventory.json').read_text())['routes']
nav={}
for a in A:
 if '/851/dist/img/' in a['url']:
  nav[a['url'].split('/')[-1].split('.')[0]]=a['file']
providers=[]
for a in A:
 if '/common/dark/slot/' in a['url'] or '/common/dark/arcade/' in a['url']:
  family='slot' if '/slot/' in a['url'] else 'arcade'
  slug=a['url'].split('/')[-1].split('.')[0]
  path=next((r['path'] for r in route if r['path'].startswith('/'+family+'/provider/') and r['path'].endswith('/'+slug)),None)
  if path:providers.append({'id':slug,'name':a['alt'],'family':family,'image':a['file'],'path':path})
alias={'idnslot':'idnslotdirect','nolimit-city':'evolution-nlc','booming':'booming_games','dst-play':'dstplay_slots','amigo-gaming':'amigo','5g-games':'5g','slot-mania':'slotmania','playtech':'playtech_slot','microgaming-live':'mg_live_grand','vivogaming':'vivo-gaming','ezugi':'ezugi-gaming','playtech-casino':'playtech','sa-gaming':'sagaming','oriental-game':'og'}
games=[]
for i,a in enumerate(A):
 if '/game-images/' not in a['url'] or 'game_logo' in a['url']:continue
 segments=a['url'].split('/game-images/')[1].split('/')
 provider=alias.get(segments[0],segments[0]);gid=segments[1]
 family='slot'
 if 100<=i<=112 or 114<=i<=117 or 203<=i<=212:family='casino'
 if 129<=i<=135:family='arcade'
 if 214<=i<=226:family='poker'
 if i>=228:family='lotto'
 p=next((p for p in providers if p['id']==provider),None)
 title=a['alt']
 if title in ['Lobby','Live - Lobby','MG Live Grand','og-lobby','ION Lobby']:
  title=(p['name'] if p else segments[0].replace('-',' ').title())+' Lobby'
 tags=['hot']
 if len(games)%3==0:tags.append('exclusive')
 if len(games)%4==0:tags.append('new')
 if len(games)%5==0:tags.append('buy-bonus')
 if len(games)%6==0:tags.append('megaways')
 if 'koi' in title.lower():tags.append('level-up')
 if family=='casino':tags += [t for t in ['roulette','baccarat','blackjack','dragon-tiger'] if t.replace('-',' ') in title.lower()]
 games.append({'id':gid,'title':title,'family':family,'provider':provider,'providerName':p['name'] if p else segments[0].replace('-',' ').title(),'image':a['file'],'tags':tags,'sourceIndex':i})
banners=[]
for a in A:
 if '/content/' in a['url'] or '/promotions/promotion_banner' in a['url']:
  ident=a['url'].split('promotion_banner_')[-1].split('_')[0] if 'promotion_banner_' in a['url'] else None
  banners.append({'image':a['file'],'title':'Promosi GOBI88','path':'/promotions/all/g'+ident if ident else '/promotions/all','id':ident})
promos=[]
for a in A:
 if '/promotions/thumbnail' in a['url']:
  ident=a['url'].split('thumbnail_')[1].split('_')[0]
  promos.append({'id':'g'+ident,'title':a['alt'],'image':a['file'],'banner':next((b['image'] for b in banners if b['id']==ident),None),'category':'sports' if 'Sports' in a['alt'] else 'slots','period':'Program promosi • Pratinjau','summary':'Jelajahi program dan detail promosi pilihan. Ketentuan serta periode aktif akan mengikuti konfigurasi agen Playground.','terms':['Penawaran ini ditampilkan sebagai contoh UI.','Bonus dan progres pada pratinjau menggunakan data demo.','Ketersediaan program mengikuti pengaturan agen saat integrasi.']})
for b in banners:
 if b['id'] and not any(p['id']=='g'+b['id'] for p in promos):promos.append({'id':'g'+b['id'],'title':'Program '+b['id'],'image':b['image'],'banner':b['image'],'category':'slots','period':'Pratinjau promosi','summary':'Lihat visual program promosi dan simulasi workflow klaim.','terms':['Data dan klaim hanya untuk simulasi UI.','Ketentuan final mengikuti konfigurasi agen.']})
lookup=lambda s:next((a['file'] for a in A if s in a['url']),None)
data={'navIcons':nav,'providers':providers,'games':games,'banners':banners,'promotions':promos,'specials':[{'image':lookup('/idn/idn-slot.jpg'),'title':'IDN Slot','path':'/slot/provider/idnslotdirect'},{'image':lookup('/idn/idn-poker.jpg'),'title':'IDN Poker','path':'/poker'},{'image':lookup('/idn/idn-live.jpg'),'title':'IDN Live','path':'/casino/provider/idnlive'}],'exclusive':[{'title':a['alt'],'image':a['file'],'path':{'IDNPOKER':'/poker','IDNSLOT':'/slot/provider/idnslotdirect','IDNLIVE':'/casino/provider/idnlive','IDN Arcade':'/arcade/provider/idnarcade','Sport GG':'/sports/virtual','Kong Original':'/arcade/provider/originals'}.get(a['alt'],'/slot/category/exclusive')} for a in A if '/default/exclusive/' in a['url']], 'sports':[{'id':a['url'].split('/')[-1].split('.')[0],'title':a['alt'],'image':a['file'],'type':'esport' if '/e-' in a['url'] else 'virtual' if 'sportgg.jpg' in a['url'] or 'sbovsports' in a['url'] else 'sport'} for a in A if '/default/sports/' in a['url']],'illustrations':{k:lookup('/default/'+v) for k,v in {'sports':'sport.png','poker':'poker.png','lotto':'lotto.png','fishing':'fishing.png','pokerHero':'poker-banner-d.webp','sportsHero':'dekstop_sport-gg.jpg','sns':'sns/banner-d.webp'}.items()},'payments':[{'title':a['alt'].split(' - ')[-1],'image':a['file']} for a in A if '/payment/' in a['url']], 'flags':{'id':lookup('/flags/id-ID.svg'),'en':lookup('/flags/en-GB.svg')},'routes':route}
data['categoryIcons']={a['url'].split('/')[-1].split('.')[0]:a['file'] for a in A if '/common/dark/slot/' in a['url']}
(root/'public/data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print(json.dumps({'games':len(games),'providers':len(providers),'banners':len(banners),'promotions':len(promos),'sports':len(data['sports'])}))
