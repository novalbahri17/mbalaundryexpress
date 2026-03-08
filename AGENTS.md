# MBA Laundry Express - AGENTS.md

Dokumen ini ditujukan untuk AI coding agents yang bekerja pada proyek MBA Laundry Express. Proyek ini adalah hasil modifikasi dari template Slash Admin menjadi aplikasi landing page publik + admin panel untuk bisnis laundry self-service.

---

## 1. Project Overview

**MBA Laundry Express** adalah aplikasi web yang terdiri dari:
- **Landing Page Publik**: Halaman marketing untuk pelanggan (React + Tailwind CSS)
- **Admin Panel**: Dashboard manajemen konten (React + Ant Design)
- **Backend**: PocketBase sebagai BaaS (Backend as a Service) dengan MySQL sebagai data source utama

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TypeScript (strict), Vite 6 |
| UI Public | Tailwind CSS 3, Framer Motion, Lottie |
| UI Admin | Ant Design 5, shadcn/ui components |
| State Management | Zustand (global), TanStack Query (server state) |
| Backend | PocketBase (Go-based BaaS) |
| Database | MySQL (via PocketBase) |
| Package Manager | pnpm 10.8.0 |
| Node Version | 20.* |

---

## 2. Project Structure

```
├── src/
│   ├── api/                    # Data access layer
│   │   ├── pocketbase.ts       # PocketBase client & auth
│   │   ├── branches.api.ts     # API branches
│   │   ├── articles.api.ts     # API artikel/blog
│   │   ├── promos.api.ts       # API promo
│   │   └── ...                 # API lainnya
│   ├── components/
│   │   ├── public/             # Komponen landing page
│   │   │   ├── home/           # Section homepage
│   │   │   ├── layout/         # Layout publik (Navbar, Footer)
│   │   │   └── shared/         # Komponen reusable publik
│   │   ├── admin/              # Komponen admin panel
│   │   ├── ui/                 # UI primitives (shadcn)
│   │   └── ...                 # Komponen umum
│   ├── pages/
│   │   ├── public/             # Halaman publik
│   │   │   ├── HomePage.tsx
│   │   │   ├── CabangListPage.tsx
│   │   │   ├── PromoPage.tsx
│   │   │   └── ...
│   │   └── admin/              # Halaman admin
│   │       ├── AdminLayout.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── cabang/
│   │       ├── promo/
│   │       └── ...
│   ├── router/
│   │   ├── index.tsx           # Router utama
│   │   ├── PublicRouter.tsx    # Route publik
│   │   └── AdminRouter.tsx     # Route admin + auth guard
│   ├── store/                  # Zustand stores
│   │   ├── userStore.ts        # Auth & user state
│   │   ├── themeStore.ts       # Dark/light mode
│   │   └── ...
│   ├── types/
│   │   └── database.types.ts   # TypeScript types 19 tabel
│   └── utils/                  # Utility functions
├── database/
│   └── seed.sql                # Schema & seed MySQL
├── deploy/                     # Konfigurasi deployment
│   └── etc/
│       ├── nginx/
│       └── systemd/
├── scripts/
│   ├── bootstrap-pocketbase.mjs  # Setup collections PB
│   ├── cron-expire-promos.mjs    # Cron job promo
│   └── setup-ufw.sh              # Firewall setup
├── pocketbase/                 # Binary PocketBase
├── pb_data/                    # Data PocketBase (local)
└── pb_migrations/              # Migrations PocketBase
```

---

## 3. Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development server (port 3000)
pnpm dev

# Build production
pnpm build

# Preview production build
pnpm preview --host 127.0.0.1 --port 3000

# Bootstrap PocketBase collections
pnpm pb:bootstrap
```

### Local Development URLs
- Publik: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- PocketBase Admin UI: http://127.0.0.1:8090/_/ (jika diakses langsung)

---

## 4. Code Style Guidelines

### Formatter & Linter
- **Biome** digunakan untuk formatting dan linting
- Konfigurasi: `biome.json`
- Indent: Tab
- Line width: 120 karakter
- Quote style: Double quotes

### Pre-commit Hooks (Lefthook)
```yaml
# Format staged files
npx @biomejs/biome format --write --no-errors-on-unmatched {staged_files}

# Lint staged files
npx @biomejs/biome lint --no-errors-on-unmatched {staged_files}

# Type check
npx tsc --noEmit
```

### Commit Convention
Menggunakan Conventional Commits:
- `feat`: Fitur baru
- `fix`: Bug fix
- `docs`: Dokumentasi
- `style`: Formatting (tidak mempengaruhi logic)
- `refactor`: Refactoring
- `perf`: Optimasi performa
- `test`: Testing
- `chore`: Build/tools
- `ci`: CI/CD
- `types`: Type definitions
- `wip`: Work in progress

### TypeScript Strict Rules
```json
{
  "strict": true,
  "strictNullChecks": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

---

## 5. Database Schema

Proyek menggunakan **19 tabel** di PocketBase/MySQL:

### Core Tables
| Tabel | Deskripsi |
|-------|-----------|
| `branches` | Data cabang laundry |
| `branch_hours` | Jam operasional per cabang |
| `branch_facilities` | Fasilitas per cabang |
| `branch_gallery` | Galeri foto cabang |
| `promos` | Promo/diskon |
| `promo_branches` | Relasi promo-cabang |
| `articles` | Artikel/blog |
| `jobs` | Lowongan kerja |
| `testimonials` | Testimoni pelanggan |
| `faqs` | FAQ |
| `page_contents` | Konten editable CMS |
| `subscribers` | Subscriber WhatsApp |
| `partnerships` | Form kemitraan |
| `contact_messages` | Pesan kontak |
| `site_settings` | Pengaturan situs |
| `spin_rewards` | Hadiah spin wheel |
| `spin_plays` | Riwayat spin |
| `loyalty_members` | Member loyalty |
| `loyalty_transactions` | Transaksi poin loyalty |

### Type Definitions
Semua tipe ada di `src/types/database.types.ts` dengan pattern:
```typescript
export interface Branch extends BaseTable {
  name: string;
  slug: string;
  // ...
}

export type CollectionRecordMap = {
  branches: Branch;
  // ...
};
```

---

## 6. API Layer Pattern

### PocketBase Client (`src/api/pocketbase.ts`)
```typescript
// Client singleton
export const pb = new PocketBase(baseUrl);

// CRUD helpers
listRecords<T>(collection, params)
getRecordById<T>(collection, id)
createRecord<T>(collection, payload)
updateRecord<T>(collection, id, payload)
deleteRecord(collection, id)
fileUrl(collection, record, filename)
```

### API Modules Pattern
Setiap domain punya file `.api.ts`:
```typescript
// src/api/branches.api.ts
export const getBranches = async (params?) => { ... }
export const getBranchById = async (id) => { ... }
export const createBranch = (payload) => { ... }
export const updateBranch = (id, payload) => { ... }
export const deleteBranch = (id) => { ... }
```

---

## 7. Authentication & Authorization

### Auth Flow
1. Admin login via `/admin/login`
2. Credentials dikirim ke PocketBase `/api/admins/auth-with-password`
3. Token disimpan di `pb.authStore` (PocketBase JS SDK)
4. User state disinkronkan ke Zustand store
5. `RequireAdminAuth` guard memeriksa session di setiap route admin

### Auth Utils
```typescript
// Cek session valid
isAuthenticated(): boolean

// Login/logout
adminLogin(payload): Promise<AdminSession>
adminLogout(): void
```

### Login Protection
- Max 5 attempts sebelum lockout 15 menit
- Session valid selama JWT token belum expired
- Auto-hydrate dari authStore saat refresh

---

## 8. Environment Variables

Copy dari `.env.example` ke `.env`:

```bash
# Frontend (VITE_ prefix)
VITE_SITE_URL=https://mba-laundry.com
VITE_SITE_NAME=MBA Laundry Express
VITE_PUBLIC_PATH=/
VITE_POCKETBASE_BASE_PATH=/pb-api
VITE_API_PROXY_TARGET=http://127.0.0.1:3002

# Backend
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@mba-laundry.com
POCKETBASE_ADMIN_PASSWORD=Admin12345!

# Security
CRON_SECRET=replace-with-random-64-char-secret

# Database
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=lauundry
MYSQL_USER=root
MYSQL_PASSWORD=

# Integrations
FONNTE_TOKEN=
GOOGLE_ANALYTICS_ID=
META_PIXEL_ID=
```

---

## 9. Deployment Architecture

### Production Stack
- **OS**: Ubuntu 22.04
- **Web Server**: Nginx (reverse proxy + SSL)
- **App Server**: PM2 (cluster mode, 2 instances)
- **Database**: MySQL 8
- **BaaS**: PocketBase (systemd service)
- **Firewall**: UFW

### Port Configuration
| Port | Service | Access |
|------|---------|--------|
| 80/443 | Nginx | Public |
| 3000 | Node App (PM2) | Localhost only |
| 8090 | PocketBase | Localhost only |
| 3306 | MySQL | Localhost only |

### Deployment Files
- `ecosystem.config.js` - PM2 configuration
- `deploy/etc/nginx/sites-available/mba-laundry` - Nginx config
- `deploy/etc/systemd/system/pocketbase.service` - PocketBase service
- `scripts/setup-ufw.sh` - Firewall rules
- `backup-mba.sh` - Backup automation

---

## 10. Testing Strategy

### Current State
- **No unit tests** configured (proyek belum setup testing framework)
- Type checking via `tsc --noEmit` sebagai quality gate
- Manual testing via dev server dan preview build

### Type Safety
- Strict TypeScript enabled
- All API responses typed via `database.types.ts`
- Path aliases configured di `tsconfig.json`:
  - `@/*` → `src/*`
  - `#/*` → `src/types/*`

---

## 11. Security Considerations

### Critical Security Points

1. **Environment Variables**
   - Jangan commit `.env` file
   - `CRON_SECRET` harus random 64+ karakter
   - Password PocketBase harus kuat

2. **PocketBase API**
   - Route `/pb-api/` hanya bisa diakses dari localhost (Nginx config)
   - Collection rules: public read-only, admin-only write
   - File uploads validated di backend

3. **Admin Panel**
   - Route `/admin/*` tidak ditautkan dari publik
   - Auth guard di setiap route admin
   - Rate limiting login (5 attempts)

4. **Firewall (UFW)**
   - Port 3000 dan 8090 blocked dari publik
   - Hanya 22 (SSH), 80, 443 yang terbuka

5. **CORS & CSP**
   - Configured di Nginx
   - File uploads limited 20MB

---

## 12. Common Tasks

### Menambah Tabel Baru

1. Update `src/types/database.types.ts`:
```typescript
export interface NewTable extends BaseTable {
  field: string;
}
export type CollectionRecordMap = {
  // ... existing
  new_table: NewTable;
}
```

2. Update `scripts/bootstrap-pocketbase.mjs`:
```javascript
const collections = [
  // ... existing
  {
    name: "new_table",
    fields: [textField("field", true)],
    // ... rules
  }
];
```

3. Buat API module `src/api/newTable.api.ts`

4. Update `tsconfig.json` includes jika perlu

### Menambah Halaman Publik

1. Buat component di `src/pages/public/NewPage.tsx`
2. Tambah route di `src/router/PublicRouter.tsx`
3. Tambah link di `src/components/public/layout/Navbar.tsx` (jika perlu)

### Menambah Menu Admin

1. Buat page di `src/pages/admin/namamenu/index.tsx`
2. Tambah route di `src/router/AdminRouter.tsx`
3. Menu otomatis muncul jika menggunakan nav-data-backend

---

## 13. Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules dist
pnpm install
pnpm build
```

### Type Errors
```bash
# Check types
npx tsc --noEmit
```

### PocketBase Connection
- Pastikan PocketBase running: `http://127.0.0.1:8090`
- Cek proxy Vite: `/pb-api` → `http://127.0.0.1:8090`
- Verifikasi credentials di `.env`

### Database Sync
```bash
# Import seed SQL
mysql -u root lauundry < database/seed.sql

# Bootstrap PocketBase collections
pnpm pb:bootstrap
```

---

## 14. External Integrations

### Fonnte (WhatsApp)
- Token disimpan di `site_settings` (key: `fonnte_token`)
- Digunakan untuk notifikasi backup dan alert

### Google Analytics
- ID disimpan di `site_settings` (key: `google_analytics_id`)
- Loaded via `@vercel/analytics`

### Meta Pixel
- ID disimpan di `site_settings` (key: `meta_pixel_id`)
- Untuk tracking conversion

---

## 15. Notes for AI Agents

- **Bahasa**: Kode dan komentar menggunakan Bahasa Indonesia untuk domain bisnis, Bahasa Inggris untuk technical terms
- **UI Pattern**: Public pages menggunakan Tailwind dengan design system custom (ruby/sapphire/teal colors)
- **Admin Pattern**: Menggunakan Ant Design dengan tema custom (primary: #C62828)
- **State**: Prefer Zustand untuk global state, TanStack Query untuk server state
- **Images**: Gunakan helper `fileUrl()` dari pocketbase.ts untuk generate URL file
- **Forms**: Gunakan React Hook Form + Zod untuk validasi
- **Icons**: Gunakan `@iconify/react` atau `lucide-react`

---

Last updated: 2026-03-05
