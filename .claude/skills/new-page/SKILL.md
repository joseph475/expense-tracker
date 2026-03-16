---
name: new-page
description: Scaffold a new dashboard page for this expense tracker with correct server/client component split and auth pattern.
---

Scaffold a new dashboard page for this expense tracker.

Page name and purpose: $ARGUMENTS

Follow these steps exactly:

1. Read `src/app/dashboard/accounts/page.tsx` to understand the server component + client component split pattern used in this project.

2. Read `src/app/dashboard/layout.tsx` to understand how auth is handled (sessions are already checked at layout level — page.tsx does NOT need its own auth check).

3. **Note on page component pattern**: Most pages that need app data use `"use client"` directly (see `accounts/page.tsx`) because all data comes from `useAppData()` (localStorage). Only create a server component page if you need server-side Supabase queries. For localStorage-only pages, the page itself can be `"use client"` and call `useAppData()` directly, then pass computed data to a separate Client component.

4. Create the page at `src/app/dashboard/[page-name]/page.tsx`. If it needs app data:
   - Add `"use client"` directive
   - Call `useAppData()` for data
   - Compute derived data with `useMemo`
   - Pass data as props to a `[PageName]Client` component

5. Create `src/app/dashboard/[page-name]/components/[PageName]Client.tsx` as a `"use client"` component for the actual UI.

6. **UI patterns — CRITICAL** — this project uses mobile-first design:

   **Page structure**:
   ```tsx
   <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
     {/* Sticky header */}
     <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
       <div>
         <h1 className="text-xl font-bold text-gray-900 dark:text-white">Page Title</h1>
         <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Subtitle</p>
       </div>
     </div>
     <div className="px-4 py-4 space-y-4">
       {/* Content */}
     </div>
   </div>
   ```

   **Cards**: `bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800`

   **Inputs** — bottom border only, NO box border:
   ```tsx
   <input className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white" />
   ```

   **Primary button**: `py-3 rounded-xl bg-indigo-600 text-white text-base font-medium`
   **Section labels**: `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3`

   For sheets/modals on this page, follow the always-mounted slide-from-right pattern (see new-sheet skill).

5. If the page should appear in the nav, remind me that the nav has exactly 3 items (Dashboard, Accounts, More) defined in `src/app/dashboard/components/Sidebar.tsx` — adding a 4th requires updating that file.

6. Show me the files created and the URL path where the page will be accessible.
