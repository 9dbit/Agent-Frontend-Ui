(() => {
  'use strict';
  const main = document.getElementById('main');
  const dialog = document.getElementById('preview');
  const title = document.getElementById('dialog-title');
  const content = document.getElementById('dialog-content');
  const toast = document.getElementById('toast');
  const pages = new Set(['home','catalog','casino','referral','guide','contact']);
  const labels = {home:'Beranda',catalog:'Katalog',casino:'Live Casino',referral:'Referral',guide:'Panduan',contact:'Kontak'};
  const studios = [{id:'A',name:'Studio Amethyst',color:''},{id:'B',name:'Studio Sapphire',color:'sapphire'},{id:'C',name:'Studio Rose',color:'rose'}];
  const entries = [
    {name:'Contoh 01',date:'2026-11-08',reviewed:true},
    {name:'Contoh 02',date:'2026-11-08',reviewed:false},
    {name:'Contoh 03',date:'2026-11-08',reviewed:true},
    {name:'Contoh 04',date:'2026-11-07',reviewed:false},
    {name:'Contoh 05',date:'2026-11-04',reviewed:true},
    {name:'Contoh 06',date:'2026-11-01',reviewed:true}
  ];
  let studioFilter = 'all', period = 'daily', opener, timer;
  function notify(message) { clearTimeout(timer); toast.textContent = message; toast.classList.add('visible'); timer = setTimeout(() => toast.classList.remove('visible'), 3500); }
  function heading(kicker, name, text) { return `<div class="section-head"><div><p class="eyebrow">${kicker}</p><h1>${name}</h1><p class="lead">${text}</p></div><span class="label">Data contoh</span></div>`; }
  function studioCards() { return studios.filter(s => studioFilter === 'all' || s.id === studioFilter).map(s => `<article class="card studio-card"><div class="studio-art ${s.color}"><span>${s.id}</span><span class="label">Preview</span></div><div class="studio-copy"><h3>${s.name}</h3><p>Contoh tampilan ruang studio.</p><button class="btn secondary" data-preview="${s.id}" type="button">Buka pratinjau</button></div></article>`).join(''); }
  function showDialog(name, html, button) { opener=button; title.textContent=name; content.innerHTML=html; dialog.showModal(); }
  function viewHome() { return `<section class="hero"><div><p class="eyebrow">64COR / CLIENT PREVIEW</p><h1>Satu tampilan. Mudah dijelajahi.</h1><p class="lead">Jelajahi contoh navigasi dan halaman website agen. Pilih menu untuk melihat alur presentasinya.</p><div class="actions"><a class="btn" href="#casino">Lihat pratinjau studio</a><a class="btn secondary" href="#guide">Panduan demo</a></div></div><div class="hero-art" aria-hidden="true"><div class="orbit"><span>64COR</span></div></div></section><div class="section-head"><div><h2>Jelajahi demo</h2><p>Tiga bagian untuk presentasi client.</p></div><span class="label">Interactive preview</span></div><div class="cards"><article class="card"><span class="card-number">01 / STUDIO</span><h3>Live Casino</h3><p>Pratinjau kartu dan ruang studio, memakai ilustrasi antarmuka.</p><a class="btn secondary" href="#casino">Buka halaman</a></article><article class="card"><span class="card-number">02 / DATA</span><h3>Referral</h3><p>Lihat filter periode dan susunan riwayat dengan data contoh.</p><a class="btn secondary" href="#referral">Buka halaman</a></article><article class="card"><span class="card-number">03 / SUPPORT</span><h3>Kontak</h3><p>Lihat penempatan bantuan pelanggan dan contoh percakapan Chatvice.</p><a class="btn secondary" href="#contact">Buka halaman</a></article></div>`; }
  function viewStudio(catalog=false) { return heading('LAYOUT PREVIEW', catalog?'Katalog demo':'Live Casino', 'Pilih studio untuk melihat contoh ruang pratinjau. Ilustrasi ini bukan siaran langsung atau sesi permainan.')+`<div class="tabs" role="group" aria-label="Filter studio"><button type="button" data-filter="all" aria-pressed="${studioFilter==='all'}">Semua studio</button>${studios.map(s=>`<button type="button" data-filter="${s.id}" aria-pressed="${studioFilter===s.id}">Studio ${s.id}</button>`).join('')}</div><div class="cards studio-grid">${studioCards()}</div>`; }
  function viewReferral() {
    const start = {daily:'2026-11-08',weekly:'2026-11-02',monthly:'2026-11-01'}[period];
    const rows = entries.filter(e => e.date >= start), reviewed = rows.filter(e => e.reviewed).length;
    return heading('DATA PREVIEW', 'Referral', 'Contoh susunan halaman referral untuk presentasi. Kode dan catatan di bawah tidak mengirim undangan atau memberikan komisi.')+`<div class="tabs" role="group" aria-label="Periode data contoh">${[['daily','Harian'],['weekly','Mingguan'],['monthly','Bulanan']].map(([key,label])=>`<button type="button" data-period="${key}" aria-pressed="${period===key}">${label}</button>`).join('')}</div><p class="page-copy">Periode contoh: ${start} – 2026-11-08</p><div class="stats"><div class="stat"><small>Entri contoh</small><strong data-stat="total">${rows.length}</strong></div><div class="stat"><small>Ditinjau</small><strong>${reviewed}</strong></div><div class="stat"><small>Menunggu</small><strong>${rows.length-reviewed}</strong></div></div><div class="split"><section class="card"><h2>Kode contoh</h2><p>Kode ini hanya untuk demonstrasi tampilan.</p><div class="copy"><code>DEMO-PREVIEW-ONLY</code><button class="btn secondary" id="copy-code" type="button">Salin kode contoh</button></div></section><section class="card"><h2>Data presentasi</h2><p>Nama dan tanggal merupakan data buatan. Perubahan filter hanya mengubah tampilan demo ini.</p><span class="label">Tidak tersambung ke akun</span></section></div><section class="card"><h2>Riwayat contoh</h2><div class="table-wrap"><table><thead><tr><th>Entri</th><th>Tanggal</th><th>Status contoh</th></tr></thead><tbody>${rows.map(e=>`<tr><td>${e.name}</td><td>${e.date}</td><td><span class="status">${e.reviewed?'Ditinjau':'Menunggu'}</span></td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function viewContact() { return heading('SUPPORT PREVIEW','Kontak','Contoh halaman bantuan pelanggan. Menu Kontak selalu berada di sisi paling kanan.')+`<div class="split"><section class="card"><span class="card-number">CHATVICE</span><h2>Bantuan dalam satu tempat</h2><p class="contact-copy">Tampilkan contoh percakapan untuk menjelaskan pengalaman bantuan kepada client.</p><button class="btn secondary" id="chat-preview" type="button">Pratinjau Chatvice</button></section><section class="card"><h2>Informasi kontak</h2><p>Detail kontak belum diisi pada demo ini. Tidak ada pesan yang dikirim atau data kontak yang disimpan.</p><span class="label">Mode presentasi</span></section></div>`; }
  function viewGuide() { return heading('PRESENTATION GUIDE','Panduan demo','Gunakan urutan ini untuk menunjukkan struktur halaman dan interaksinya.')+`<section class="card"><ol class="steps"><li>Buka <strong>Live Casino</strong>, pilih filter studio, lalu buka dan tutup pratinjau.</li><li>Buka <strong>Referral</strong> dan ganti periode Harian, Mingguan, atau Bulanan untuk melihat data contoh berubah.</li><li>Buka <strong>Kontak</strong> di paling kanan, lalu tampilkan contoh percakapan Chatvice.</li><li>Pilih <strong>Reset demo</strong> untuk kembali ke awal presentasi.</li></ol><p>Demo ini tidak menggunakan akun nyata, transaksi, undangan, komisi, siaran video, atau sesi permainan. Tidak ada data yang dikirim ke API operasional.</p></section>`; }
  function render(focus=false) {
    let page=location.hash.slice(1)||'home';
    if(!pages.has(page)){page='home';history.replaceState(null,'',location.pathname+location.search+'#home');}
    if(dialog.open)dialog.close();
    main.innerHTML=({home:viewHome,catalog:()=>viewStudio(true),casino:viewStudio,referral:viewReferral,guide:viewGuide,contact:viewContact})[page]();
    document.title=labels[page]+' · 64COR Demo';
    document.querySelectorAll('[data-page]').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    main.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{studioFilter=button.dataset.filter;render();main.querySelector(`[data-filter="${studioFilter}"]`)?.focus();});
    main.querySelectorAll('[data-period]').forEach(button=>button.onclick=()=>{period=button.dataset.period;render();main.querySelector(`[data-period="${period}"]`)?.focus();});
    main.querySelectorAll('[data-preview]').forEach(button=>button.onclick=()=>{const s=studios.find(x=>x.id===button.dataset.preview);showDialog(s.name,`<div class="demo-screen"><div class="studio-art ${s.color}"><span>${s.id}</span><span class="label">Tampilan contoh</span></div><p>Ruang pratinjau untuk presentasi desain. Tidak ada siaran video atau sesi permainan.</p></div>`,button);});
    const copy=main.querySelector('#copy-code');
    if(copy)copy.onclick=async()=>{try{await navigator.clipboard.writeText('DEMO-PREVIEW-ONLY');notify('Kode contoh disalin. Kode ini tidak aktif.');}catch{notify('Salin manual: DEMO-PREVIEW-ONLY');}};
    const chat=main.querySelector('#chat-preview');
    if(chat)chat.onclick=()=>showDialog('Chatvice · contoh percakapan','<span class="label">Preview — tidak mengirim pesan</span><div class="conversation"><div class="bubble">Halo! Ada yang bisa kami bantu?</div><div class="bubble reply">Saya ingin melihat panduan penggunaan.</div><div class="bubble">Silakan buka menu Panduan. Ini adalah contoh tampilan percakapan.</div></div>',chat);
    if(focus){main.focus();window.scrollTo({top:0,behavior:'instant'});}
  }
  document.getElementById('close-preview').onclick=()=>dialog.close();
  document.querySelector('.skip').onclick=event=>{event.preventDefault();main.focus();main.scrollIntoView?.({block:'start'});};
  dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});
  document.getElementById('reset').onclick=()=>{period='daily';studioFilter='all';if(location.hash==='#home')render(true);else location.hash='home';notify('Demo dikembalikan ke awal.');};
  addEventListener('hashchange',()=>render(true));
  render();
})();
