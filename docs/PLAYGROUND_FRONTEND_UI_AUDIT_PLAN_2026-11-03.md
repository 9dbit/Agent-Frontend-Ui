# Playground Agent Frontend — Gobi88 UI Audit & Implementation Plan

Tanggal: 3 November 2026 (Asia/Jakarta)  
Sumber referensi: https://gobi88.com/  
Repo target: https://github.com/9dbit/Agent-Frontend-Ui  
Status checkpoint: audit awal + rencana implementasi; aplikasi belum dibangun/deploy.

## 1. Tujuan dan batas tahap ini

Membuat template frontend Playground berdasarkan struktur visual, navigasi, dan komponen Gobi88. Tahap pertama berfokus pada UI desktop/tablet/mobile dan interaksi menggunakan data demo. Sinkronisasi backend admin Playground adalah tahap berikutnya.

Permintaan pengguna adalah mempelajari dan memberikan breakdown terlebih dahulu. Karena itu checkpoint ini berisi hasil audit, inventaris referensi, rancangan komponen, urutan kerja, dan kriteria penerimaan. Ini bukan klaim bahwa clone, seluruh aset, atau semua fungsi website sudah selesai.

## 2. Metode dan tingkat bukti

Audit memakai halaman yang dirender di browser pengguna dan sesi yang sudah login. Hanya tampilan serta navigasi dibaca. Tidak ada permainan dijalankan, taruhan dibuat, deposit/withdraw diajukan, pesan dikirim, atau data akun diubah.

| Status | Makna |
|---|---|
| INSPECTED | Halaman berhasil dibuka dan konten/struktur DOM diperiksa |
| REDIRECT_INSPECTED | Tautan sumber dibuka dan redirect ke halaman yang diperiksa |
| DISCOVERED_NOT_INSPECTED | Tautan ditemukan di navigasi; halaman detail dan perilakunya belum diperiksa |
| PLANNED | Rancangan Playground; bukan fakta terverifikasi dari Gobi88 |

Cakupan yang berhasil diperiksa:
- Homepage, drawer/menu, serta link header dan footer.
- Slots Hot.
- Eksklusif.
- Sports+.
- Casino Lobby.
- Poker.
- Lotto Populer.
- Homepage pada viewport 1440×1000, 768×1024, dan 393×852.
- Metadata repo dan inventaris proyek/service Railway.

Navigasi lanjutan ke kelompok Arcade/Fishing/Promosi mengalami timeout dan tidak menghasilkan bukti yang lengkap. Pengambilan aset massal juga timeout. Panggilan pemeriksaan koneksi berikutnya tidak kembali normal. Status halaman dan aset tersebut tetap terbuka, bukan ditandai selesai.

Data pribadi dari sesi sumber, identitas akun permainan, saldo, cookies, token, dan screenshot akun tidak disertakan dalam berkas referensi yang dipublikasikan.

## 3. Temuan visual terukur

| Bagian | Bukti saat audit desktop |
|---|---|
| Background body | rgb(26,24,24), yaitu #1a1818 |
| Font stack | Avenir, Helvetica Neue, Arial, sans-serif |
| Body font-size | 16 px |
| Header | Tinggi 54 px |
| Navigasi kategori utama | Tinggi 99 px; ikon kategori sekitar 40 px |
| Container | Maksimum 1200 px; area dalam yang terukur 1168 px |
| Hero utama | Gambar sumber 800×280, rasio 20:7 |
| Hero desktop | Banner utama 776 px + panel spesial 384 px pada pengukuran viewport 1440 |
| Gambar panel spesial | Sumber IDN 562×344; ditampilkan dalam panel dengan crop |
| Thumbnail game | Umumnya 214×145; sebagian 215×145 |
| Game grid homepage | Enam kolom pada desktop |
| Provider rail | Ikon sekitar 54 px dengan nama di bawah |
| Drawer | Lebar terukur 300 px |
| Tombol cepat | Promosi ungu, Histori biru, Deposit hijau |
| Detail visual | Permukaan charcoal, ikon kategori merah, sudut kecil, informasi relatif padat |

Warna aksen tombol di atas adalah pengamatan visual, belum seluruhnya diekstrak menjadi nilai CSS. Jangan mengganti gaya referensi dengan tema baru secara tidak sengaja.

Homepage berurutan:
1. Header: menu, logo, inbox, identitas akun, saldo, deposit.
2. Navigasi kategori utama.
3. Ticker pengumuman.
4. Carousel banner + panel Spesial, dengan tombol Promosi/Histori/Deposit.
5. Breadcrumb/navigasi teks.
6. Rail kategori/provider Slots.
7. Hot Slots.
8. Top Tables.
9. Casino dan Arcade.
10. Sports+, Eksklusif, Promosi.
11. Panel Lotto, Poker, Fishing.
12. Footer navigasi, teks informasi, metode deposit, partner, copyright.
13. Kontrol mengambang RTP dan widget chat.

## 4. Sitemap dan modul

### A. Shell global dan homepage — diperiksa

12 menu utama: Eksklusif, Sports+, Slots, Casino, Poker, Lotto, Arcade, Fishing, Promosi, Leaderboard, Referral, Kontak.

Drawer juga menampilkan Cari, Deposit, Bonus, Free Spins, Withdraw, Akun Saya, Informasi akun, Inbox, Aktivitas, Riwayat Bermain, Keluar, serta pemilih bahasa Indonesia/Inggris.

Komponen rencana: AppHeader, MainCategoryNav, MobileDrawer, AnnouncementTicker, HeroCarousel, SpecialCarousel, QuickActions, Breadcrumbs, ProviderRail, GameCard, SectionCard, AppFooter, FloatingHelp.

Perilaku yang perlu dibangun: buka/tutup drawer, active route, carousel manual/autoplay, swipe, tab aktif, ticker, footer collapse/expand, kontrol chat demo, dan navigasi tautan.

### B. Slots — diperiksa pada Hot, tautan lain ditemukan

- /slot/category/hot
- /slot/category/exclusive
- /slot/category/new
- /slot/category/buy-bonus
- /slot/category/table
- /slot/category/megaways
- /slot/category/spin-royal
- /slot/category/level-up
- /slot/provider/:provider
- /sns

43 rute provider Slots ditemukan. Ini jumlah tautan unik yang teramati, bukan jaminan jumlah provider aktif permanen.

Halaman Hot mempunyai sidebar kategori/provider, rail ikon, judul aktif, input pencarian permainan, tombol Cari, dan grid game. Search submission belum diuji.

Rencana: katalog berbasis data; pencarian, filter kategori/provider, hasil kosong, skeleton, load error, dan fallback gambar. Tombol game membuka halaman/detail preview demo. Peluncuran provider asli menunggu integrasi.

### C. Casino — diperiksa pada Lobby

/casino mengarah ke /casino/category/lobby.

Kategori terlihat: Lobby, Top, Game Shows, Roulette, Baccarat, Sic Bo, Dragon Tiger, Blackjack, Ball Games, IDN Special. Terdapat input pencarian dan checkbox filter provider. Lobby menampilkan 14 kartu saat audit, disertai identitas provider dan jumlah game.

Rencana: CasinoTabs, ProviderFilter, CasinoLobbyCard, TableCard. Filter disiapkan sebagai state URL yang dapat di-refresh dan dibagikan. Pemilihan checkbox dan seluruh kategori perlu diuji pada audit lanjutan.

### D. Sports+ — diperiksa

Rute terlihat:
- /sports
- /sports/sport
- /sports/esport
- /sports/virtual

Tampilan berupa kartu provider dan CTA Main. Provider yang terlihat mencakup PGSport, SABA Sports, SBOBET, UboBet, NSOFT, BTI, CMD368, Saba eSports, TFGaming, dan Sport GG.

Rencana: tab kategori dan grid kartu provider. CTA menggunakan simulasi launch, bukan membuka sesi provider sumber.

### E. Poker — diperiksa

Halaman memperlihatkan identitas permainan, Copy, Download Aplikasi, dan Main Sekarang. Identitas akun sumber tidak dimasukkan ke template.

Rencana: gunakan identitas dummy, toast salin, kartu informasi aplikasi, dan launch preview. File APK sumber tidak diunduh atau dijalankan saat audit.

### F. Lotto — diperiksa pada Populer

/lotto/ mengarah ke /lotto/popular.

Tautan yang ditemukan:
- /lotto/popular
- /lotto/lotto
- /lotto/e-lottery
- /lotto/lotteries
- /lotto/results
- /lotto/results/idn-lotto

UI menampilkan tab, live result, tanggal hasil, digit hasil, countdown, dan kartu E-Lottery. Data hasil yang berubah tidak dijadikan fakta statis dalam template.

Rencana: LotteryTabs, ResultCard, Countdown, HistoryFilter dan demo data dengan waktu terkontrol.

### G. Eksklusif — diperiksa

Halaman menggunakan kartu/gambar besar yang mengarah ke Poker, IDNSLOT, Slot Mania, IDNArcade, PP 98% RTP, Spin Royal, Level Up dan Kong Original.

Rencana: layout landing kategori dengan ukuran/crop gambar tersendiri, bukan menggunakan thumbnail game kecil untuk semua kebutuhan.

### H. Arcade dan Fishing — link ditemukan; detail belum selesai

- /arcade/category/hot
- /arcade/category/new
- /arcade/provider/:provider
- /fishing

Provider Arcade yang terlihat dari homepage: IDNArcade, PragmaticPlay, Minigame, Askmeslot, Kong Original, Microgaming, KY.

Rencana: turunan komponen katalog, mengikuti audit detail berikutnya. Jangan menganggap tombol, modal, atau seluruh state kategori ini sudah diuji.

### I. Promosi dan Leaderboard — link ditemukan; detail belum selesai

- /promotions/all
- /promotions/all/:promotionId
- /leaderboard/distributed

Homepage memuat banner dan poster promosi. Poster promo contoh berukuran 447×598. Tautan detail memakai ID seperti g757, g744, dan g698.

Rencana: PromotionGrid, PromotionDetail, filter kategori jika terverifikasi, panel periode/syarat, leaderboard dan status kosong. Isi promo dibuat sebagai data yang dapat diganti per agen.

### J. Member dan wallet — menu ditemukan; form detail belum diperiksa

- /deposit
- /withdraw/bank-transfer
- /user/
- /user/bonuses
- /user/referral/history
- /user/messages/
- /user/activity
- /user/history

Audit berikutnya harus mencatat field, tab, validasi, error, status kosong, history detail, dan seluruh deep link dari halaman-halaman ini.

Rencana Playground: AccountShell, BalancePanel, DepositForm, WithdrawForm, BonusList, ReferralSummary, MessageList, ActivityTable, PlayHistory.

Semua nominal, rekening, profil, histori dan notifikasi untuk demo adalah data sintetis. Form menampilkan hasil simulasi yang jelas. Saldo dan transaksi nyata baru bersumber dari backend Playground pada fase integrasi.

### K. Konten informasi dan autentikasi

Tautan yang ditemukan:
- /about-us
- /contact
- /referral
- /legal/responsible-gaming
- /legal/terms-and-conditions
- /legal/privacy-policy
- /complaint
- /search
- /en

Halaman login/registrasi/lupa password belum diperiksa karena sesi sumber sedang login. Rute autentikasi tidak ditebak sebagai fakta.

Rencana: halaman informasi, kontak, pencarian, bahasa, dan auth UI. Label kontrol dipertahankan sesuai fungsi. Teks editorial panjang ditulis sebagai konten Playground dengan struktur dan tujuan setara; tidak menyalin seluruh artikel pemasaran atau pernyataan legal Gobi88.

## 5. Responsive: bukti dan target implementasi

Temuan utama: mengganti viewport menjadi 393×852 lalu reload tetap menghasilkan class app-header--d. Hero tetap dua kolom, grid game tetap enam kolom, dan provider saling bertumpuk. Pada 768×1024, halaman juga tetap menggunakan mode desktop dengan rail navigasi horizontal.

Ini membuktikan perilaku halaman desktop dalam viewport sempit; bukan bukti tampilan native perangkat mobile Gobi88. Belum diverifikasi apakah situs punya rendering berbasis user-agent atau varian mobile lain.

Target Playground berikut adalah keputusan desain yang direncanakan:

| Lebar | Target layout |
|---|---|
| 360–430 px | Header ringkas, drawer, satu kolom utama, 2–3 kartu game sesuai lebar minimum, provider rail swipe |
| 600–767 px | Grid 3–4 kartu, panel form satu kolom, banner tetap proporsional |
| 768–1023 px | Tablet portrait, 4 kartu; sidebar menjadi drawer/filter panel |
| 1024–1279 px | Tablet landscape/laptop kecil, 4–5 kartu; hero dua kolom bila cukup ruang |
| 1280 px ke atas | Container maksimum 1200 px, enam kartu, hero 2:1 dan navigasi lengkap |

Kriteria:
- Tidak ada horizontal overflow pada halaman; hanya rail dan tabel tertentu boleh scroll internal.
- Gambar memakai aspect-ratio yang sesuai dan crop eksplisit.
- Nama game tidak menutupi gambar; panjang teks ditangani konsisten.
- Target sentuh sekitar 44 px, drawer dapat ditutup, fokus keyboard jelas.
- Modal/form tidak melebihi viewport; scroll terkunci hanya saat overlay aktif.
- Footer dan tombol mengambang memperhitungkan safe-area perangkat.
- Uji 360, 393, 430, 768, 820, 1024, 1280, 1440 dan 1920 px.
- Verifikasi akhir pada perangkat mobile asli, termasuk portrait/landscape.

## 6. Inventaris aset dan teks

Hasil yang disimpan pada checkpoint ini:
- 238 URL gambar unik dari tujuh keluarga halaman yang diperiksa.
- Format: 122 WebP, 93 SVG, 16 JPG, 6 PNG, 1 GIF.
- Homepage asset inventory mencatat 173 aset image, 1 font, dan 2 stylesheet pada satu state. Angka ini berbeda dari jumlah node img karena duplikasi carousel, background, dan state halaman.
- 131 rute internal non-launch unik yang ditemukan.
- Manifest gambar menyimpan URL sumber, alt label, dimensi intrinsik teramati, halaman asal, dan status akuisisi.
- Manifest rute menyimpan path, label navigasi, dan status inspeksi.

Belum ada klaim bahwa byte seluruh gambar berhasil diunduh. Percobaan bundle massal timeout dan tidak mengembalikan manifest hasil yang dapat diverifikasi. Asset acquisition status pada manifest adalah URL_OBSERVED_BYTES_NOT_VERIFIED.

Langkah akuisisi berikut:
1. Ambil aset per halaman/state dan kelompok kecil.
2. Aktifkan lazy loading melalui scroll yang wajar, lalu perbarui inventaris.
3. Deduplikasi berdasarkan URL dan hash; jangan gunakan nama thumbnail.webp sebagai nama unik.
4. Klasifikasi menjadi brand, navigation, banners, providers, games, promotions, payments, backgrounds, fonts.
5. Simpan ukuran, format, hash, provenance dan penggunaan komponen.
6. Periksa aset kosong/gagal, SVG invalid, animasi GIF, rasio/crop dan versi mobile bila ada.
7. Layani aset lokal dari deployment; jangan menggantungkan UI pada hotlink sumber.
8. Simpan label UI dan konten demo terstruktur. Pisahkan identitas Playground dari aset referensi Gobi88.

Script runtime, tracker, widget chat asli, endpoint transaksi dan token sumber tidak dibawa ke aplikasi.

## 7. Arsitektur implementasi yang diusulkan

Frontend: React + TypeScript + Vite, routing berbasis URL, dan CSS design tokens. Ini adalah pilihan implementasi yang diusulkan; dependensi belum dipasang.

Struktur:
- src/app: router, shell, providers.
- src/components: header, drawer, carousel, cards, forms, filters, tables, modal, toast.
- src/features: home, catalog, casino, sports, lotto, promotions, account, wallet, referral, support.
- src/data: mock catalog, providers, promotions, account, transaction states, translations.
- src/services: kontrak data dan mock adapter.
- src/config: brand/theme/navigation/feature flags per agen.
- public/assets: aset lokal yang telah diverifikasi.
- docs/reference: inventaris dan checklist parity.
- server: static server SPA untuk Railway, health endpoint dan cache assets.

Konfigurasi template per agen: brand name, logo, accent colors, bahasa, ticker, menu aktif, banner desktop/mobile, provider/kategori aktif, promo, footer dan kontak.

Kontrak data awal yang perlu disiapkan: AgentTheme, NavigationItem, Banner, Provider, Game, Promotion, LeaderboardRow, Account, WalletSummary, PaymentMethod, Transaction, Bonus, ReferralSummary dan Notification.

Adapter mock dan adapter API memiliki bentuk data yang sama. Saat integrasi, backend tetap menjadi sumber otoritatif untuk akun, tenant, saldo, entitlement bonus dan status transaksi. Secret tidak ditempatkan dalam bundle frontend.

## 8. Rencana sinkronisasi backend berikutnya

Persiapan UI dilakukan sekarang; koneksi aktif menunggu fase integrasi.

| Domain frontend | Sumber backend yang direncanakan |
|---|---|
| Brand/menu/banner/footer | Pengaturan dan CMS agen |
| Katalog/provider | Provider registry dan game catalog |
| Login/profile | Auth dan profil player |
| Wallet/history | Wallet ledger dan transaksi player |
| Deposit/withdraw | Payment orchestration agen |
| Bonus/promosi | Promotion/bonus service |
| Referral | Referral dan commission service |
| Inbox/activity | Notification dan audit activity |

UI pembayaran perlu dapat menerima konfigurasi satu rekening sumber atau rekening deposit/withdraw terpisah sesuai workflow Playground. Field dan label final harus mengikuti kontrak backend, bukan disimpulkan dari Gobi88 saja.

## 9. Urutan pekerjaan

| Tahap | Pekerjaan | Bukti selesai |
|---|---|---|
| P0 — audit lanjutan | Tutup gap deep pages, guest/auth, promosi, wallet, mobile native; unduh aset terverifikasi | Coverage matrix dan asset manifest tanpa klaim ambigu |
| P1 — fondasi | Repo app, routing, design tokens, brand config, mock data, shell responsive | Semua route dasar terbuka dan refresh aman |
| P2 — homepage/katalog | Hero, specials, rails, game cards, slots/casino/sports/lotto/arcade/fishing | Visual dan fungsi UI cocok dengan evidence tiap keluarga |
| P3 — member/konten | Auth demo, account, wallet demo, bonus, referral, inbox, history, promo/detail, informational pages | Form state, validasi lokal, empty/loading/error/success demo |
| P4 — QA | Route crawl, asset check, pencarian/filter, keyboard, viewport, image comparison | Checklist lulus, dev console dan asset errors diperbaiki |
| P5 — GitHub/Railway | Commit implementation, reviewable PR, service baru, domain, health dan smoke test | URL live, commit SHA, status deployment dan checkpoint |
| P6 — backend | Cocokkan kontrak dengan admin Playground dan aktifkan adapter API | Contract/integration tests dan alur data terverifikasi |

## 10. Deployment target

Repo diperiksa: 9dbit/Agent-Frontend-Ui, public, branch default main. README awal ada; belum ditemukan aplikasi yang dapat dijalankan dari pemeriksaan awal. AGENTS.md root tidak ditemukan.

Railway: proyek Playground ditemukan dengan service playground-admin, playground-ui-sandbox, playground-agent-sandbox dan Postgres.

Rencana: buat service frontend terpisah bernama playground-agent-frontend dari repo Agent-Frontend-Ui. Nama tersebut adalah rencana, belum dibuat. Gunakan source branch implementasi yang telah diuji, domain Railway, bind 0.0.0.0:$PORT, SPA fallback, health endpoint, dan asset caching.

Deployment tidak dilakukan pada checkpoint ini karena pengguna meminta breakdown terlebih dahulu dan repo baru berisi dokumen audit. Service admin dan sandbox existing tetap menjadi target integrasi, bukan tempat mengganti frontend secara langsung.

## 11. Acceptance checklist

- [ ] Semua route pada coverage matrix memiliki status akhir, termasuk detail dan empty state.
- [ ] Guest dan member punya shell serta navigasi yang konsisten.
- [ ] Tidak ada dead link internal.
- [ ] Search/filter/provider/category bekerja pada data demo.
- [ ] Carousel, swipe, drawer, accordion, modal dan toast berfungsi.
- [ ] UI wallet menampilkan simulasi dan tidak menghasilkan transaksi live.
- [ ] Semua aset yang dipakai tersedia lokal, dimensi/crop benar dan tidak broken.
- [ ] Semua konten brand dapat diganti lewat config/data.
- [ ] Desktop/tablet/mobile lulus matriks viewport.
- [ ] Native mobile diverifikasi secara terpisah.
- [ ] Tidak ada data akun sumber, token, tracker atau endpoint transaksi sumber dalam repo.
- [ ] Build dan smoke test lulus sebelum deploy.
- [ ] Domain/HTTPS, route refresh dan health endpoint Railway terverifikasi.
- [ ] Checkpoint mencatat commit, URL deployment, hasil QA dan pekerjaan tersisa.

## 12. Berkas pendamping

- reference/gobi88-asset-inventory.json — 238 referensi gambar, belum bukti unduh byte.
- reference/gobi88-route-inventory.json — 131 rute non-launch beserta status inspeksi.

Prioritas berikutnya: pulihkan inspeksi browser, lengkapi deep-page dan native-mobile evidence, kemudian implementasi P1–P5 dengan data demo. Sinkronisasi admin dilakukan setelah UI dan interaksi frontend stabil.
