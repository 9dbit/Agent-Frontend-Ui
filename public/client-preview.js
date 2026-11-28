// Presentation-only views. No player state, invitations, sessions or API calls.
const previewStudios = [
  {id:'A',name:'Studio Amethyst',tone:'amethyst'},
  {id:'B',name:'Studio Sapphire',tone:'sapphire'},
  {id:'C',name:'Studio Rose',tone:'rose'}
];
const previewEntries = [
  {name:'Contoh 01',date:'2026-11-08',reviewed:true},
  {name:'Contoh 02',date:'2026-11-08',reviewed:false},
  {name:'Contoh 03',date:'2026-11-08',reviewed:true},
  {name:'Contoh 04',date:'2026-11-07',reviewed:false},
  {name:'Contoh 05',date:'2026-11-04',reviewed:true},
  {name:'Contoh 06',date:'2026-11-01',reviewed:true}
];
let previewStudio = 'all', previewPeriod = 'daily';
export function clientPreviewRoute(url) {
  if(/^\/casino(?:\/|$)/.test(url))return 'casino';
  if(/^\/(?:user\/)?referral(?:\/|$)/.test(url))return 'referral';
  return null;
}
const previewArt = studio => `<div class="client-studio-art ${studio.tone}"><span>${studio.id}</span><small>PREVIEW</small></div>`;
function previewHeading(title,description) {
  return `<div class="page-title"><h1>${title}</h1><span class="demo-chip">DEMO CLIENT</span></div><p class="page-intro">${description}</p><div class="client-preview-actions"><a data-route href="/" class="btn secondary small">Kembali ke beranda</a><button class="btn secondary small" type="button" data-action="client-preview-reset">Reset demo</button></div>`;
}
export function renderClientPreview(kind) {
  if(kind==='casino')return `<section class="client-preview" aria-label="Live Casino demo">${previewHeading('Live Casino','Pratinjau studio untuk presentasi client. Ilustrasi ini bukan siaran langsung atau sesi permainan.')}<div class="tabs" role="group" aria-label="Filter studio">${[['all','Semua studio'],...previewStudios.map(s=>[s.id,'Studio '+s.id])].map(([id,label])=>`<button type="button" class="tab ${previewStudio===id?'active':''}" data-action="client-preview-filter" data-value="${id}" aria-pressed="${previewStudio===id}">${label}</button>`).join('')}</div><div class="client-studio-grid">${previewStudios.filter(s=>previewStudio==='all'||s.id===previewStudio).map(s=>`<article class="panel client-studio-card">${previewArt(s)}<h2>${s.name}</h2><p class="muted">Contoh tampilan ruang studio.</p><button class="btn block" data-action="client-preview-studio" data-value="${s.id}" type="button">Buka pratinjau</button></article>`).join('')}</div></section>`;
  if(kind!=='referral')return '';
  const start={daily:'2026-11-08',weekly:'2026-11-02',monthly:'2026-11-01'}[previewPeriod];
  const rows=previewEntries.filter(e=>e.date>=start),reviewed=rows.filter(e=>e.reviewed).length;
  return `<section class="client-preview" aria-label="Referral demo">${previewHeading('Referral','Data contoh untuk presentasi. Kode tidak mengirim undangan atau memberikan komisi.')}<div class="tabs" role="group" aria-label="Periode data contoh">${[['daily','Harian'],['weekly','Mingguan'],['monthly','Bulanan']].map(([id,label])=>`<button type="button" class="tab ${previewPeriod===id?'active':''}" data-action="client-preview-period" data-value="${id}" aria-pressed="${previewPeriod===id}">${label}</button>`).join('')}</div><p class="muted">Periode contoh: ${start} – 2026-11-08</p><div class="stat-grid"><div class="stat"><small>Entri contoh</small><strong data-preview-total>${rows.length}</strong></div><div class="stat"><small>Ditinjau</small><strong>${reviewed}</strong></div><div class="stat"><small>Menunggu</small><strong>${rows.length-reviewed}</strong></div></div><section class="panel"><h2>Kode contoh</h2><p class="muted">Kode ini hanya untuk demonstrasi tampilan.</p><div class="client-preview-code"><code>DEMO-PREVIEW-ONLY</code><button class="btn secondary" type="button" data-action="client-preview-copy">Salin kode contoh</button></div></section><section class="panel"><h2>Riwayat contoh</h2><div class="table-wrap"><table><thead><tr><th>Entri</th><th>Tanggal</th><th>Status contoh</th></tr></thead><tbody>${rows.map(e=>`<tr><td>${e.name}</td><td>${e.date}</td><td>${e.reviewed?'Ditinjau':'Menunggu'}</td></tr>`).join('')}</tbody></table></div></section></section>`;
}
export async function handleClientPreview(button,{render,modal,toast}) {
  const {action,value}=button.dataset;
  if(action==='client-preview-filter'&&['all','A','B','C'].includes(value))previewStudio=value;
  else if(action==='client-preview-period'&&['daily','weekly','monthly'].includes(value))previewPeriod=value;
  else if(action==='client-preview-reset'){previewStudio='all';previewPeriod='daily';}
  else if(action==='client-preview-studio'){
    const studio=previewStudios.find(s=>s.id===value);if(!studio)return;
    return modal(studio.name,`<div class="client-preview">${previewArt(studio)}<p class="notice">Ruang pratinjau untuk presentasi desain. Tidak ada siaran video atau sesi permainan.</p></div>`);
  }else if(action==='client-preview-copy'){
    try{await navigator.clipboard.writeText('DEMO-PREVIEW-ONLY');toast('Kode contoh disalin. Kode ini tidak aktif.');}
    catch{toast('Salin manual: DEMO-PREVIEW-ONLY');}
    return;
  }else return;
  render();
  document.querySelector(`[data-action="${action}"]${value?`[data-value="${value}"]`:''}`)?.focus();
}
