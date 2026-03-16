---
name: new-sheet
description: Scaffold a new slide-from-right sheet component for this expense tracker, following the always-mounted animation pattern.
---

Scaffold a new slide-from-right sheet component for this expense tracker.

The sheet name and purpose: $ARGUMENTS

Follow these steps exactly:

1. Read `src/app/dashboard/components/AddTransactionSheet.tsx` to understand the exact pattern used for always-mounted panels.

2. Create the new sheet component in the appropriate directory:
   - Dashboard-level sheets → `src/app/dashboard/components/`
   - Account-related → `src/app/dashboard/accounts/components/`
   - Asset-related → `src/app/dashboard/assets/components/`

3. The sheet MUST use the always-mounted animation pattern:
```tsx
// Backdrop — z-50, blur
<div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
  open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
}`} onClick={onClose} />
// Panel — z-60, full screen
<div className={`fixed inset-0 z-60 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
  open ? "translate-x-0" : "translate-x-full pointer-events-none"
}`}>
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 shrink-0">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h2>
      <button onClick={onClose} className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <X className="h-5 w-5" />
      </button>
    </div>
    {/* Content */}
    <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
      ...
    </div>
  </div>
</div>
```

4. **UI patterns — CRITICAL** — this project uses mobile-first design with specific input/button styles:

   **Inputs** — bottom border only, NO box border, transparent background, `text-base` fixed size:
   ```tsx
   <input className="w-full px-0 py-3 text-base bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 transition placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white" />
   ```

   **Picker triggers** (buttons that look like inputs):
   ```tsx
   <button className="w-full flex items-center justify-between py-3 text-base bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none transition text-left">
     <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}>{value || "Placeholder"}</span>
     <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
   </button>
   ```

   **Primary button**: `py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base font-medium transition`
   **Cancel button**: `py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 transition`
   **Button row**: `flex gap-3 pt-4 mt-6` — primary `flex-3`, cancel `flex-1`

   **Bottom sheet pickers** (z-70, slides from bottom):
   ```tsx
   <div className={`fixed inset-0 z-70 bg-black/40 transition-opacity duration-300 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setShow(false)}>
     <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[60vh] overflow-hidden transform transition-transform duration-300 ease-out ${show ? "translate-y-0" : "translate-y-full"}`} onClick={e => e.stopPropagation()}>
       <div className="p-4 border-b border-gray-100 dark:border-gray-700">
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
       </div>
       <div className="overflow-y-auto max-h-[50vh] p-4">...</div>
     </div>
   </div>
   ```

   **Grid items** (categories, accounts): `flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-center`
   **Error**: `p-3 bg-red-50 dark:bg-red-950 rounded-xl` + `text-sm text-red-600 dark:text-red-400`

   **Body scroll lock** when sheet opens:
   ```tsx
   useEffect(() => {
     document.body.style.overflow = open ? "hidden" : "";
     return () => { document.body.style.overflow = ""; };
   }, [open]);
   ```

5. If the sheet needs a trigger button that's mobile-only, create a companion `[Name]Button.tsx` with `className="md:hidden"`.

6. Wire up `useAppData()` for any data reads/writes needed.

7. Show me the files created and where to import/use them.
