# Backend MBA Laundry Express

Backend sekarang **Express + MySQL**. Tidak ada server lain — semua data dan file
dilayani oleh API server sendiri.

```
Browser (React SPA)
      │
      │  /api/*  dan  /uploads/*
      ▼
Vite dev server (port 3000)  ──proxy──►  API server (port 3002)
                                              │
                                              ├─► MySQL  43.156.144.127 : laundry
                                              └─► folder  uploads/
```

Di production, Nginx melayani `dist/` (hasil `pnpm build`) dan meneruskan
`/api/*` + `/uploads/*` ke API server port 3002.

---

## 1. Menjalankan

Butuh dua proses: API server dan Vite.

```bash
pnpm api     # API server  -> http://localhost:3002
pnpm dev     # frontend    -> http://localhost:3000
```

Mode auto-reload saat ngoding:

```bash
pnpm api:dev
```

Kalau mau satu perintah saja, `package.json` bisa ditambah script
`concurrently`, tapi dua terminal lebih gampang dibaca log-nya.

---

## 2. Konfigurasi

Semua lewat `.env` (lihat `.env.example` untuk daftar lengkap).

| Variabel | Fungsi |
|---|---|
| `API_PORT` | Port API server (default `3002`) |
| `API_ADMIN_EMAIL` / `API_ADMIN_PASSWORD` | Akun admin panel |
| `API_JWT_SECRET` | Kunci tanda tangan token login |
| `UPLOAD_DIR` | Folder simpan file upload (default `uploads`) |
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` | Koneksi MySQL |
| `VITE_API_PROXY_TARGET` | Alamat API server yang di-proxy Vite saat dev |

### Akun admin

Saat API server pertama kali dijalankan, tabel `_admins` dibuat otomatis dan
diisi dari `API_ADMIN_EMAIL` + `API_ADMIN_PASSWORD`. Password disimpan sebagai
hash SHA-256, bukan teks biasa.

Ganti email / password kapan saja lewat **Admin → Pengaturan → Keamanan Akun**.
Ganti juga `API_JWT_SECRET` di production — kalau tidak, token bisa dipalsukan.

---

## 3. Struktur file

| File | Isi |
|---|---|
| `server/index.mjs` | Seluruh API server (~650 baris, tanpa framework tambahan) |
| `src/api/client.ts` | API client di sisi frontend |
| `scripts/mysql-schema.sql` | Skema 19 tabel |
| `scripts/create-mysql-tables.mjs` | Membuat tabel tanpa perlu CLI `mysql` |

---

## 4. Endpoint

Server ini memakai bentuk REST standar supaya kode halaman hampir tidak perlu
diubah.

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/api/health` | – | Cek server hidup |
| `POST` | `/api/collections/_superusers/auth-with-password` | – | Login admin |
| `POST` | `/api/collections/_superusers/update` | ✔ | Ganti email / password admin |
| `GET` | `/api/collections/:collection/records` | – | Daftar + `page`, `perPage`, `filter`, `sort` |
| `GET` | `/api/collections/:collection/records/:id` | – | Satu record |
| `POST` | `/api/collections/:collection/records` | ✔ | Tambah (mendukung upload file) |
| `PATCH` | `/api/collections/:collection/records/:id` | ✔ | Ubah (mendukung upload file) |
| `DELETE` | `/api/collections/:collection/records/:id` | ✔ | Hapus + hapus file terkait |
| `GET` | `/api/files/:collection/:recordId/:filename` | – | Ambil file |

Auth memakai header `Authorization: Bearer <token>`.

### Format filter

Sintaks filter teks lalu diterjemahkan ke SQL:

```
filter=is_active = true
filter=name ~ "Bohar"                     # ~  -> LIKE %...%
filter=slug = "pagesangan"
filter=is_active = true && name ~ "Bohar"
sort=-created                             # - = DESC
```

### Format tanggal

UTC dengan sufiks `Z`:

```
2026-03-19 21:57:00.000Z
```

Kolom `DATETIME` di MySQL presisinya detik (`.000`), jadi milidetik selalu nol.
Ini tidak memengaruhi tampilan maupun pengurutan.

---

## 5. Upload file

File dikirim sebagai `multipart/form-data`, disimpan ke `UPLOAD_DIR` dengan nama
acak, dan **yang masuk ke MySQL hanya nama filenya**.

Artinya: **folder `uploads/` wajib ikut di-backup.** Kalau folder ini hilang,
database tetap utuh tapi semua gambar jadi 404.

Di `.gitignore` folder `uploads` sudah dikecualikan, jadi tidak ikut ke repo.
Untuk production, arahkan `UPLOAD_DIR` ke volume yang persisten.

---

## 6. Gambar & file

Semua file hasil upload disimpan di `UPLOAD_DIR` (default `uploads/`) dengan nama
acak, dan **yang masuk ke MySQL hanya nama filenya**. Tidak ada sumber file lain:
kalau tidak ada di `uploads/`, `GET /api/files/...` langsung membalas `404`.

Artinya: **folder `uploads/` wajib ikut di-backup.** Kalau folder ini hilang,
database tetap utuh tapi semua gambar jadi 404.

Di `.gitignore` folder `uploads` sudah dikecualikan, jadi tidak ikut ke repo.
Untuk production, arahkan `UPLOAD_DIR` ke volume yang persisten.

Folder `uploads/` sudah otomatis dibuat saat API server start, jadi tidak perlu
bikin manual.

---

## 7. Catatan

> Jangan jalankan `pnpm mysql:drop` kecuali benar-benar mau menghapus seluruh
> isi database.

---

## 7. Perintah berguna

```bash
pnpm api          # jalankan API server
pnpm api:dev      # API server dengan auto-reload
pnpm dev          # frontend
pnpm build        # build frontend ke dist/

pnpm mysql:create           # buat tabel dari scripts/mysql-schema.sql
pnpm mysql:drop             # HAPUS semua tabel (hati-hati!)

# perintah yang sering dipakai saat cek manual
curl http://127.0.0.1:3002/api/health
curl "http://127.0.0.1:3002/api/collections/branches/records?perPage=10"
```

---

## 8. Sebelum deploy

- [ ] Ganti `API_ADMIN_PASSWORD` dan `API_JWT_SECRET` dengan nilai acak panjang.
- [ ] Pastikan `uploads/` ada di volume persisten dan ikut di-backup.
- [ ] Proxy `/api/*` dan `/uploads/*` ke port 3002 (lihat `deploy/nginx/`).
- [ ] Jalankan API server lewat process manager supaya otomatis hidup lagi
      kalau crash (`ecosystem.config.js` sudah tersedia untuk PM2).
- [ ] Jangan pernah commit `.env`.
