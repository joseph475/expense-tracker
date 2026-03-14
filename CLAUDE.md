# Money Tracker — Claude Context

## Project Overview
A personal money tracking PWA built with **Next.js App Router** and **Supabase**. Tracks income/expenses with categories, manages account assets, and shows net worth.

## Stack
| Layer      | Tech                                        |
|------------|---------------------------------------------|
| Frontend   | Next.js 16 (App Router, Server Components)  |
| Backend    | Supabase (Postgres + Auth via @supabase/ssr)|
| Language   | TypeScript                                  |
| Styling    | Tailwind CSS v4                             |
| Icons      | lucide-react                                |

## Project Structure
```
src/
├── middleware.ts                          # Auth guard (cookie check, no network call)
├── app/
│   ├── layout.tsx                         # PWA meta (manifest, apple-mobile-web-app)
│   ├── auth/
│   │   ├── page.tsx                       # Checks session → redirect /dashboard if valid
│   │   ├── actions.ts                     # Server Actions: login, signup
│   │   ├── callback/route.ts              # OAuth callback handler
│   │   └── components/AuthForm.tsx        # Client component — login/signup toggle
│   └── dashboard/
│       ├── layout.tsx                     # Session guard + Sidebar; signOut() on stale cookie
│       ├── page.tsx                       # Dashboard (Today/Month/Date filter, summary, transactions)
│       ├── transaction-actions.ts         # Server Action: addTransaction
│       ├── components/
│       │   ├── Sidebar.tsx                # Desktop sidebar + mobile bottom nav (3 items)
│       │   ├── DashboardFilterTabs.tsx    # Today / This Month / Pick Date tabs + date input
│       │   ├── AddTransactionButton.tsx   # FAB (mobile-only, md:hidden)
│       │   ├── AddTransactionSheet.tsx    # Bottom sheet form for new transaction
│       │   └── CategoryPicker.tsx         # Scrollable emoji category selector
│       ├── accounts/
│       │   ├── page.tsx                   # Server component; fetches assets + assetCategories
│       │   └── components/AccountsClient.tsx  # Client: edit mode, inline value edit, delete
│       ├── assets/
│       │   ├── page.tsx                   # Redirect stub → /dashboard/accounts
│       │   ├── actions.ts                 # addAsset, updateAssetValue, deleteAsset
│       │   └── components/
│       │       ├── AddAssetSheet.tsx      # Bottom sheet; dynamic category radio pills
│       │       ├── AddAssetButton.tsx     # Passes assetCategories to AddAssetSheet
│       │       └── AssetCard.tsx          # Uses AssetWithCategory (joined category data)
│       ├── balance/
│       │   └── page.tsx                   # Ledger table grouped by asset category (not in nav)
│       ├── categories/
│       │   ├── actions.ts                 # addCategory, deleteCategory, addAssetCategory, deleteAssetCategory
│       │   └── components/
│       │       ├── CategoryManager.tsx    # Tx category list + add form
│       │       └── AssetCategoryManager.tsx  # Asset category list + add form + liability toggle
│       ├── settings/
│       │   ├── page.tsx                   # "More" page; passes data to MorePageClient
│       │   └── components/MorePageClient.tsx  # Bottom sheet menus: categories, asset categories, currency
│       └── transactions/
│           └── page.tsx                   # Redirect stub → /dashboard (PWA cache safety)
├── lib/supabase/
│   ├── server.ts                          # createClient() for Server Components / Actions
│   └── client.ts                          # createClient() for Client Components
└── types/database.ts                      # TypeScript interfaces for all DB rows
```

## Navigation
3 nav items (Sidebar + mobile bottom nav):
- **Dashboard** (`/dashboard`) — LayoutDashboard icon
- **Accounts** (`/dashboard/accounts`) — Wallet icon
- **More** (`/dashboard/settings`) — MoreHorizontal icon

## Database Schema

### `categories`
| Column    | Type    | Notes                                      |
|-----------|---------|--------------------------------------------|
| id        | UUID PK |                                            |
| name      | TEXT    |                                            |
| icon      | TEXT    | emoji                                      |
| type      | TEXT    | `"expense"` or `"income"`                  |
| user_id   | UUID?   | NULL = default (locked); set = user-custom |

### `transactions`
| Column      | Type          | Notes                         |
|-------------|---------------|-------------------------------|
| id          | UUID PK       |                               |
| user_id     | UUID FK       | → auth.users                  |
| category_id | UUID FK       | → categories                  |
| account_id  | UUID? FK      | → assets (nullable)           |
| type        | TEXT          | `"expense"` or `"income"`     |
| amount      | NUMERIC(12,2) |                               |
| description | TEXT?         |                               |
| date        | DATE          |                               |
| created_at  | TIMESTAMPTZ   |                               |
| updated_at  | TIMESTAMPTZ   |                               |

### `asset_categories`
| Column       | Type    | Notes                              |
|--------------|---------|------------------------------------|
| id           | UUID PK |                                    |
| user_id      | UUID?   | NULL = default (locked); set = user|
| name         | TEXT    |                                    |
| icon         | TEXT    | emoji                              |
| is_liability | BOOLEAN | true → shown in rose/liability group|

### `assets`
| Column            | Type          | Notes                                        |
|-------------------|---------------|----------------------------------------------|
| id                | UUID PK       |                                              |
| user_id           | UUID FK       |                                              |
| name              | TEXT          |                                              |
| category          | TEXT          | legacy field (cash/investment/property/etc.) |
| asset_category_id | UUID? FK      | → asset_categories (new, preferred)          |
| current_value     | NUMERIC(12,2) |                                              |
| interest_rate     | DECIMAL?      | annual %; requires manual ALTER if missing   |
| created_at        | TIMESTAMPTZ   |                                              |
| updated_at        | TIMESTAMPTZ   |                                              |

### `asset_snapshots`
| Column    | Type    | Notes                              |
|-----------|---------|------------------------------------|
| id        | UUID PK |                                    |
| asset_id  | UUID FK | → assets                           |
| user_id   | UUID FK |                                    |
| value     | NUMERIC |                                    |
| year      | INT     |                                    |
| month     | INT     |                                    |
| created_at| TIMESTAMPTZ |                               |

### `user_settings`
| Column          | Type | Notes         |
|-----------------|------|---------------|
| user_id         | UUID PK FK    |               |
| currency_code   | TEXT | e.g. `"USD"`  |
| currency_symbol | TEXT | e.g. `"$"`    |

## Auth Pattern — CRITICAL
- **Middleware** (`middleware.ts`): only checks for existence of `sb-*-auth-token` cookie — no network call, no redirect loop risk. Only blocks unauthenticated users from protected routes. Does NOT redirect authenticated users away from `/auth` (prevents redirect loops from stale cookies).
- **Auth page** (`auth/page.tsx`): async server component; calls `getSession()` and redirects to `/dashboard` if valid.
- **Dashboard layout**: calls `getSession()`, then `signOut()` before redirect if no session (clears stale cookie).
- **Server Components / page.tsx**: use `getSession()` — local JWT decode, no network call, safe on mobile.
- **Server Actions**: use `getUser()` — makes network call to verify token, correct for mutations.

```
getSession() → local JWT decode, safe for page rendering, won't fail on flaky mobile network
getUser()    → network call to Supabase, use only in Server Actions (mutations)
```

## Supabase Client Pattern
| Context                      | Import from             |
|------------------------------|-------------------------|
| Server Components / Actions  | `@/lib/supabase/server` |
| Client Components            | `@/lib/supabase/client` |

## Dashboard Filter State
Stored in URL search params (`?view=today|month|date&date=YYYY-MM-DD`). `DashboardFilterTabs` reads/writes via `useRouter` + `useSearchParams`. Default view is `"today"`.

## Asset Category Display
Assets store both `asset_category_id` (FK, new) and legacy `category` text field for backwards compatibility. All display code uses joined `assetCategory` data with fallback to legacy values:
```ts
assetCategory?.name ?? LEGACY_LABELS[asset.category]
assetCategory?.icon ?? LEGACY_ICONS[asset.category]
assetCategory?.is_liability ?? asset.category === "liability"
```

## PWA
- `public/manifest.json`: `display: "standalone"`, `start_url: "/dashboard"`, `theme_color: "#4f46e5"`
- `app/layout.tsx` metadata: `appleWebApp: { capable: true, statusBarStyle: "black-translucent" }`
- User must re-add to iOS home screen after manifest changes for standalone mode to take effect.

## Key Conventions
- All IDs are UUIDs (`gen_random_uuid()`).
- Money stored as `NUMERIC(12,2)` — never `FLOAT`.
- Dates stored as `DATE`; timestamps as `TIMESTAMPTZ`.
- TypeScript types in `src/types/database.ts` — keep in sync with schema.
- Default categories/asset categories have `user_id = NULL` and are not deletable by users.
- Redirect stubs exist at `/dashboard/transactions` and `/dashboard/assets` to prevent 404s from cached PWA URLs.

## Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Known Manual Migrations
If `interest_rate` column is missing from `assets`:
```sql
ALTER TABLE assets ADD COLUMN IF NOT EXISTS interest_rate decimal;
```
