---
name: check-types
description: Audit TypeScript types and localStorage data consistency for this expense tracker. Checks database.ts vs AppDataContext, UUID fallbacks, and money handling.
---

Audit TypeScript types and localStorage data consistency for this expense tracker.

Run the following checks:

1. **Read** `src/types/database.ts` — this is the canonical type reference.

2. **Read** `src/lib/AppDataContext.tsx` — check that every interface/type used matches what's in database.ts. Flag any:
   - Fields used in AppDataContext that aren't in database.ts types
   - Types defined in AppDataContext that should be in database.ts instead

3. **Read** `src/lib/defaults.ts` — verify DEFAULT_CATEGORIES and DEFAULT_ASSET_CATEGORIES match the `Category` and `AssetCategoryRow` interfaces.

4. **Search** for any inline type definitions across components that should live in database.ts:
   - Grep for `interface ` and `type =` in `src/app/dashboard/`
   - Report anything that looks like a re-definition of a database type

5. **Check UUID generation** — grep for `crypto.randomUUID()` usages and flag any that are missing the Math.random() fallback (required for iPhone HTTP context).

6. **Check money handling** — grep for `parseFloat` or `toFixed` on transaction/asset amounts and flag potential float precision issues.

Report findings as a numbered list with file:line references. If everything looks good, say so clearly.
