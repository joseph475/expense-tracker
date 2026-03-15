# Money Tracker — Claude Context

## Project Overview
A personal money tracking PWA built with **Next.js App Router** and **localStorage** (Supabase used only for auth + cloud backup). Tracks income/expenses with categories, manages account assets, shows net worth, and displays spending statistics.

## Stack
| Layer      | Tech                                        |
|------------|---------------------------------------------|
| Frontend   | Next.js 16 (App Router, Server Components)  |
| Backend    | Supabase (Postgres + Auth via @supabase/ssr)|
| Data store | localStorage (all app data; Supabase = auth + backup only) |
| Language   | TypeScript                                  |
| Styling    | Tailwind CSS v4                             |
| Icons      | lucide-react                                |
| Charts     | recharts (BarChart, PieChart on stats page) |

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
│       │   ├── AddTransactionSheet.tsx    # Slides from right; inner pickers slide from bottom
│       │   ├── TransactionDetailsModal.tsx # Slides from right; always mounted for animation
│       │   ├── SearchAndFilter.tsx        # Search + account filter; both slide from right
│       │   └── CategoryPicker.tsx         # Scrollable emoji category selector
│       ├── accounts/
│       │   ├── page.tsx                   # Server component; fetches assets + assetCategories
│       │   └── components/AccountsClient.tsx  # Client: edit mode, inline value edit, delete
│       ├── assets/
│       │   ├── page.tsx                   # Redirect stub → /dashboard/accounts
│       │   ├── actions.ts                 # addAsset, updateAssetValue, deleteAsset
│       │   └── components/
│       │       ├── AddAssetSheet.tsx      # Slides from right; always mounted for animation
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
│       │   ├── actions.ts                 # saveBackup, loadBackup, getLastBackupTime (Supabase)
│       │   └── components/
│       │       ├── MorePageClient.tsx     # Settings menu; BottomSheet slides from right
│       │       └── SettingsForm.tsx       # Currency picker; slides from right
│       └── stats/
│           ├── page.tsx                   # Stats server component
│           └── components/
│               ├── StatsClient.tsx        # Period filter, summary, charts, category breakdowns
│               ├── BarChart.tsx           # Recharts 6-month income vs expense bar chart
│               └── MiniPieChart.tsx       # Recharts donut chart (used 2-up for expense/income)
│       └── transactions/
│           └── page.tsx                   # Redirect stub → /dashboard (PWA cache safety)
├── lib/
│   ├── AppDataContext.tsx                 # ALL app state; localStorage read/write; CRUD ops
│   ├── supabase/
│   │   ├── server.ts                      # createClient() for Server Components / Actions
│   │   └── client.ts                      # createClient() for Client Components
│   └── defaults.ts                        # DEFAULT_CATEGORIES, DEFAULT_ASSET_CATEGORIES
└── types/database.ts                      # TypeScript interfaces for all DB rows
```

## Navigation
3 nav items (Sidebar + mobile bottom nav):
- **Dashboard** (`/dashboard`) — LayoutDashboard icon
- **Accounts** (`/dashboard/accounts`) — Wallet icon
- **More** (`/dashboard/settings`) — MoreHorizontal icon

## Data Architecture — CRITICAL
All app data lives in **localStorage**, keyed by `mt_${userId}_${type}`:
- `mt_${userId}_transactions`
- `mt_${userId}_assets`
- `mt_${userId}_categories`
- `mt_${userId}_asset_categories`
- `mt_${userId}_settings`

`AppDataContext` (`src/lib/AppDataContext.tsx`) is the single source of truth — loads from localStorage on mount, provides CRUD functions, computes derived/joined data. Supabase is only used for:
1. Auth (login/signup/session)
2. Cloud backup (`backups` table — one row per user, JSONB blob)

## Cloud Backup
- `settings/actions.ts`: `saveBackup`, `loadBackup`, `getLastBackupTime` (Server Actions using `getUser()`)
- Backup = serialize all localStorage keys → upsert to `backups` table
- Restore = read JSONB → write back to localStorage → `window.location.reload()`
- Required SQL migration (run once in Supabase SQL Editor):
```sql
create table backups (
  user_id uuid references auth.users primary key,
  data jsonb not null,
  backed_up_at timestamptz default now()
);
alter table backups enable row level security;
create policy "Users can manage their own backup"
  on backups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Animation Pattern — CRITICAL
**CSS transitions do NOT fire when going from `display:none` to `display:block`.**

All slide-from-right full-screen panels must be **always mounted** and use transform + pointer-events:
```tsx
// ✅ CORRECT — always mounted, uses transform to hide
<div className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
  open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
}`} onClick={onClose} />
<div className={`fixed inset-0 z-60 bg-white transform transition-transform duration-300 ease-in-out ${
  open ? "translate-x-0" : "translate-x-full pointer-events-none"
}`}>

// ❌ WRONG — display:none kills the transition
<div className={`${open ? "block" : "hidden"}`}>
  <div className="fixed inset-0 ...">
```

**Bottom-sheet pickers** (appear from bottom, inside a parent sheet) use **conditional rendering** — they don't need always-mounted because their parent panel is already off-screen when closed.

## Stats Page
`StatsClient.tsx` layout (top to bottom):
1. Header + period filter chips (Month / Year / All) + date picker trigger
2. Summary row: Income | Expenses | Net
3. "Last 6 Months" bar chart (always all transactions, ignores period filter)
4. "By Category" dual mini pie charts (Expenses left, Income right)
5. "Top Expenses" + "Top Income" category lists with proportional bars
6. Empty state if no transactions in period

Charts use `recharts`. Add `style={{ touchAction: "pan-y" }}` to chart wrapper divs to prevent recharts from blocking page scroll on mobile.

Pie chart colors: assigned by **rank position** (index-based via `getColorByIndex`) so adjacent segments are always visually distinct. Color palette defined in `CHART_COLORS` array in StatsClient.tsx.

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
| Column        | Type          | Notes                              |
|---------------|---------------|------------------------------------|
| id            | UUID PK       |                                    |
| user_id       | UUID FK       | → auth.users                       |
| category_id   | UUID FK       | → categories                       |
| account_id    | UUID? FK      | → assets (nullable)                |
| to_account_id | UUID? FK      | → assets (for transfers)           |
| type          | TEXT          | `"expense"`, `"income"`, `"transfer"` |
| amount        | NUMERIC(12,2) |                                    |
| description   | TEXT?         |                                    |
| date          | DATE          |                                    |
| created_at    | TIMESTAMPTZ   |                                    |
| updated_at    | TIMESTAMPTZ   |                                    |

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
| Column     | Type        | Notes            |
|------------|-------------|------------------|
| id         | UUID PK     |                  |
| asset_id   | UUID FK     | → assets         |
| user_id    | UUID FK     |                  |
| value      | NUMERIC     |                  |
| year       | INT         |                  |
| month      | INT         |                  |
| created_at | TIMESTAMPTZ |                  |

### `user_settings`
| Column          | Type    | Notes        |
|-----------------|---------|--------------|
| user_id         | UUID PK FK |           |
| currency_code   | TEXT    | e.g. `"USD"` |
| currency_symbol | TEXT    | e.g. `"$"`   |

### `backups`
| Column       | Type        | Notes                          |
|--------------|-------------|--------------------------------|
| user_id      | UUID PK FK  | → auth.users                   |
| data         | JSONB       | all localStorage data as blob  |
| backed_up_at | TIMESTAMPTZ | auto-set on upsert             |

## Auth Pattern — CRITICAL
- **Middleware** (`middleware.ts`): only checks for existence of `sb-*-auth-token` cookie — no network call, no redirect loop risk.
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
Assets store both `asset_category_id` (FK, new) and legacy `category` text field. All display code uses joined `assetCategory` data with fallback:
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
- All IDs are UUIDs (`gen_random_uuid()`). On client, use `crypto.randomUUID()` with Math.random() fallback (HTTP context on iPhone doesn't have secure context).
- Money stored as `NUMERIC(12,2)` — never `FLOAT`.
- Dates stored as `DATE`; timestamps as `TIMESTAMPTZ`.
- TypeScript types in `src/types/database.ts` — keep in sync with schema.
- Default categories/asset categories have `user_id = NULL` and are not deletable by users.
- Redirect stubs exist at `/dashboard/transactions` and `/dashboard/assets` to prevent 404s from cached PWA URLs.
- Tailwind v4: use canonical numeric classes (`z-60`, `z-70`) not arbitrary (`z-[60]`).

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

Backups table (required for cloud backup feature):
```sql
create table backups (
  user_id uuid references auth.users primary key,
  data jsonb not null,
  backed_up_at timestamptz default now()
);
alter table backups enable row level security;
create policy "Users can manage their own backup"
  on backups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
