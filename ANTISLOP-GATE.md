# Laporan Delivery Gate: Anti-Slop

Status: **PASS** untuk semua blok yang bisa diuji.
Tanggal audit: 23 Oktober 2026.
Referensi aturan: `anti-slop/skills/antislop/SKILL.md` + `antislop-ui` + `antislop-copywriting`.

---

## Blok 1: Hard Gate

| Aturan | Status | Bukti |
|---|---|---|
| R-02 em dash | **PASS** | 0 em dash dan 0 en dash di seluruh `src/**`. Dipindai dua kali dengan skrip Node (PowerShell salah baca encoding UTF-8). Contoh perbaikan: `src/styles/tokens.css` (11 komentar), `FacilityIconPicker.tsx`, `BlogEditor.tsx`, `EditorInspector.tsx`. |
| R-03 horizontal overflow | **PASS** | 13 rute publik diuji pada viewport 375px: `scrollWidth` selalu <= `innerWidth` (selisih -10px karena scrollbar). Admin di 375px: `scrollWidth` 365 vs `innerWidth` 375. |
| R-17 angka tanpa sumber | **PASS** | `TestimonialsSection` mengembalikan `null` saat data kosong (tidak memalsukan testimoni). `/tentang` menyatakan "Jumlah cabang aktif saat ini: 3" yang diambil dari database, bukan hardcode. |
| R-23/R-24 tombol mati | **PASS** | Semua tautan Navbar dan Footer mengarah ke rute nyata. Tidak ada `href="#"` sebagai CTA. |
| R-25/R-26 kode mati | **PASS** | 10 komponen yatim dihapus (lihat bagian "Perubahan"). |
| R-27 empat keadaan UI | **PASS** | Lihat Blok 3. |
| R-32 fokus keyboard | **PASS** | 8 kali Tab di `/admin/cabang/tawangsari00001/fasilitas` menghasilkan `outline: auto 1px` pada setiap elemen. |
| R-33/R-34 dua tema | **PASS** | Lihat Blok 3. |
| R-35 bukti klik | **PASS** | Semua verifikasi di bawah dilakukan di browser sungguhan, bukan dari kode saja. |
| R-37 arah desain tertulis | **PASS** | `DESIGN.md` di root repo: Design Read, tiga dial (ENERGY 2 / RHYTHM 2 / MOTION 1), tabel warna, tipografi, bentuk, gerak, ikon, konten, empat keadaan, aksesibilitas, larangan. |
| R-38 klaim karangan | **PASS** | `StickyBanner.tsx` yang memuat klaim karangan "Diskon member baru hingga 20% minggu ini" sudah dihapus karena tidak pernah dirender. |

---

## Blok 2: Purpose-Gate

| Aturan | Status | Bukti |
|---|---|---|
| R-01 tujuan tiap bagian | **PASS** | Setiap rute punya tepat 1 `h1` (diverifikasi lewat `document.querySelectorAll('h1').length` = 1 di 13 rute). |
| R-04 ikon harus mewakili isi | **PASS setelah perbaikan** | 3 pelanggaran diperbaiki (lihat bagian "Perubahan"). |
| R-10/R-13 dosis glassmorphism dan glow | **PASS** | Tidak ada orb beranimasi maupun gradient blur dekoratif di komponen yang dirender. |
| R-19 gerak punya alasan | **PASS setelah perbaikan** | Animasi loop tanpa akhir di `AnnouncementModal` dihapus. Sisa `repeat: Infinity` hanya di `HeroImageGrid` (marquee galeri, disengaja dan berhenti saat `prefers-reduced-motion`) serta skeleton loading. |
| R-29 jumlah warna | **PASS** | Palet publik memakai token `--brand`, `--sapphire`, `--teal`, plus netral. Tidak ada warna acak per komponen. |

---

## Blok 3: Liveliness (bukti di browser)

### Empat keadaan UI (R-27)

Komponen bersama: `src/components/admin/QueryState.tsx` (`TableEmptyState`, `TableErrorState`).

| Keadaan | Bukti |
|---|---|
| Memuat | Ant Design `Skeleton` / `Table loading` pada 11 halaman admin. |
| Kosong | Terbukti live di `/admin/cabang/tawangsari00001/fasilitas`. Teks tbody: `"Belum ada fasilitas. Tambahkan fasilitas pertama supaya pelanggan tahu apa saja yang tersedia di cabang ini."` |
| Gagal | Terbukti live. Rute `branch_facilities` dipaksa balas HTTP 500. `[role="alert"]` berisi: `"Gagal memuat fasilitas cabang / Simulasi gagal / Muat ulang"`. Tombol "Muat ulang" diklik dan tabel kembali normal (`hasTable: true`). |
| Terisi | 8 halaman admin (`/admin/cabang`, `/faq`, `/promo`, `/testimoni`, `/galeri`, `/loker`, `/kemitraan`, `/pesan`) masing-masing menampilkan 1 tabel dengan 1 sampai 10 baris data. |

### Sapuan rute publik

13 rute diuji pada viewport desktop dan 375px. Semua membalas HTTP 200, 1 `h1`, tanpa error konsol, tanpa overflow horizontal:

`/`, `/cabang`, `/cabang/tawangsari`, `/harga`, `/kalkulator`, `/faq`, `/kontak`, `/karir`, `/blog`, `/promo`, `/galeri`, `/testimoni`, `/tentang`

### Sapuan admin

13 rute admin diuji. Error konsol: **tidak ada**.
`/admin/cabang`, `/faq`, `/promo`, `/testimoni`, `/galeri`, `/loker`, `/kemitraan`, `/pesan`, dan 5 sub-tab cabang (`/`, `/jam`, `/mesin`, `/fasilitas`, `/galeri`).

### Tema gelap (R-34)

- Publik: `documentElement.classList.contains("dark")` = `true`, warna `h1` berubah menjadi `rgb(248, 250, 252)`.
- Admin: kartu `rgb(26, 29, 39)`, header tabel `rgb(27, 27, 40)` dengan teks `rgb(231, 234, 244)`, teks sel `rgb(203, 213, 225)`.
- Persistensi: pilihan tema gelap bertahan setelah muat ulang (diperbaiki, lihat "Perubahan").

---

## Blok 4: Craftsmanship

- `pnpm build` hijau: `built in 40.45s`, PWA `precache 127 entries (4153.96 KiB)`, `dist/sw.js` + `dist/workbox-f215eaee.js` dihasilkan.
- `get_errors` bersih pada semua file yang diubah.
- Tidak ada file sementara yang tertinggal di `scripts/`.

---

## Perubahan pada audit ini

### Ikon generik diganti ikon yang menyebut isinya (R-04)

| File | Sebelum | Sesudah | Alasan |
|---|---|---|---|
| `src/components/public/home/WhyUsSection.tsx` | `Zap` (petir) untuk "Proses Super Cepat" | `Clock` | Petir adalah ikon hype; jam mewakili durasi siklus. |
| `src/components/public/home/PricingSection.tsx` | `Sparkles` untuk "Hitung Estimasi Biaya" | `Calculator` | Kelip-kelip tidak berhubungan dengan perhitungan. |
| `src/components/public/home/AnnouncementModal.tsx` | `Sparkles` untuk pengumuman promo | `BadgePercent` | Diskon lebih tepat diwakili tanda persen. |

### Animasi loop dekoratif dihapus (R-19)

`src/components/public/home/AnnouncementModal.tsx`:
- Lonceng bergetar terus-menerus (`rotate: [0,-15,15,...]`, `repeat: Infinity`) menjadi statis.
- Ikon promo berdenyut (`scale: [1,1.1,1]`, `repeat: Infinity`) menjadi statis.
- Kunci pas berputar terus-menerus (`rotate: [0,10,-10,0]`, `repeat: Infinity`) menjadi statis.

### Kode mati dihapus (R-25/R-26)

Sepuluh komponen tidak pernah diimpor ke mana pun dan dihapus:

`ServicesSection.tsx`, `StickyBanner.tsx`, `TestimoniSection.tsx`, `TrustBadges.tsx`, `KalkulatorSection.tsx`, `PromoToastNotice.tsx`, `BrandLogo.tsx`, `FloatingCTA.tsx`, `AnimatedOrb.tsx`, `LottiePlayer.tsx`.

`StickyBanner.tsx` juga memuat klaim karangan (R-38) dan `ServicesSection.tsx` memakai tiga ikon generik (R-04); menghapusnya menutup keduanya.

### Bug tema gelap diperbaiki

`src/App.tsx` memeriksa `localStorage.getItem("mba-theme")`, padahal kunci persist di `src/store/themeStore.ts` adalah `"mba-theme-storage"`. Akibatnya kondisi selalu benar dan `setMode("light")` dipanggil di setiap muat halaman, menghapus pilihan tema pengguna.

Sekarang kuncinya benar, dan pilihan tema bertahan setelah muat ulang (diverifikasi: `mode: "dark"` sebelum dan sesudah reload).

---

## Catatan keterbatasan

- Verifikasi keadaan gagal dilakukan dengan memaksa respons HTTP 500 lewat intersepsi jaringan, bukan dengan mematikan server API. Ini menguji jalur kode yang sama.
- Target sentuh di Footer berupa tautan teks setinggi 21px. Ini dianggap wajar untuk tautan dalam daftar dan bukan tombol aksi utama, sehingga tidak diubah.
