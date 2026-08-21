# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build Commands
```bash
pnpm dev          # Dev server (port 3000)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm pb:bootstrap # Setup PocketBase collections
npx tsc --noEmit  # Type check only
```

## Code Style (Non-Obvious Configs)
- **Biome** with tab indent, 120 char line width, double quotes
- **`src/ui/` is EXCLUDED from biome linting** (shadcn/ui components)
- **TypeScript strict mode** with `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
- `useUnknownInCatchVariables: false` (catch errors are `unknown` by default)

## Custom Path Aliases
```
@/*         → src/*
@/api/*     → src/api/*
@/components/* → src/components/*
#/*         → src/types/*
```

## Tailwind Custom Design System
- **Colors**: `ruby` (#C62828 primary), `sapphire` (#1565C0), `teal` (#00695C)
- **Typography**: `display`, `h1-h4`, `body`, `caption` with custom sizing
- **Spacing**: `section`, `section-sm`, `container-x`
- **Animations**: `orbFloat`, `drumSpin`, `fadeInUp`, `shimmer`, `floatY`
- **Gradients**: `gradient-primary`, `gradient-aurora`, `gradient-mesh`

## PocketBase Integration (src/api/pocketbase.ts)
- **ALWAYS use `escapeFilterValue(value)`** before passing strings to PocketBase filters
- **`fileUrl()`** returns sanitized file URLs - use this instead of constructing URLs manually
- **`getFirstRecord(collection, filter)`** - returns null if not found (unlike getList which throws)
- **Auth**: `pb.authStore` holds session; `isAdminSession()` checks for "admin", "superuser", or "auth" token types
- **API proxy path**: Vite proxies `/pb-api` → `POCKETBASE_URL` (not `/api`)
- **Default base URL**: Falls back to `https://pb.mbalaundryexpress.com` (production!) if `VITE_POCKETBASE_BASE_PATH` unset
- **Auto-cancellation disabled**: `pb.autoCancellation(false)` allows concurrent requests

## Type System (src/types/database.types.ts)
```typescript
// All collections typed via CollectionRecordMap
type CollectionName = keyof CollectionRecordMap;
type CollectionRecord<T extends CollectionName> = CollectionRecordMap[T];

// Use for type-safe CRUD operations
listRecords<T extends CollectionName>(collection: T, params?): Promise<PaginatedResponse<CollectionRecord<T>>>
```

## Auth Store (src/store/userStore.ts)
- **Login lockout**: 5 failed attempts → 15-minute lockout (`lockUntil` timestamp)
- **`hydrateFromAuthStore()`** - syncs PocketBase authStore to Zustand on page refresh
- `RequireAdminAuth` guard in `AdminRouter.tsx` checks `isAdminSession()` AND `token.accessToken`

## Zustand Store Pattern
State updates via `actions` object:
```typescript
const useStore = create<Store>((set) => ({
  state: {},
  actions: {
    update: (data) => set((s) => ({ state: { ...s.state, ...data } })),
  },
}));
export const useActions = () => useStore((s) => s.actions);
```

## Build Artifacts
- Manual chunks: `a`(react), `b`(router), `c`(antd), `d`(axios), `e`(zustand/query), `f`(apexcharts)
- Console/debugger **stripped** in production via esbuild
- PWA name: "MBA Laundry Express", theme_color: #C62828

## Development URLs
- App: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- PocketBase: http://127.0.0.1:8090/_/ (direct access only)
