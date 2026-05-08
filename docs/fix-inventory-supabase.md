# Fix: Supabase Inventory Integration

## Root Cause

The inventory module previously relied on a local React state (`useState` inside `InventoryProvider`) filled with hardcoded mock data. This approach prevented proper persistent data storage, caused data to reset on application reload, and lacked real-time backend capabilities required for a production environment.

## Fix Description

- **Supabase Client**: Created a configured Supabase client inside `src/lib/supabase.ts` using the project's environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Store Migration**: Entirely rewrote `src/stores/useInventoryStore.tsx` to retrieve arrays (`products`, `balances`, `movements`, `requisitions`) from Supabase instances on mount rather than initializing static arrays.
- **Error Handling & Loading States**: Added `isLoading` and `error` states to the inventory store. Explicitly detects code `42P01` (Relation does not exist) to assist developers in maintaining the schema.
- **UI Degradation Component**: Created the reusable `InventoryStateWrapper` (`src/components/admin/inventory/InventoryStateWrapper.tsx`). This component abstracts loading states (displaying structural skeletons) and handles error rendering securely with actionable "Retry" feedback through Shadcn UI alerts.
- **View Enhancements**: Migrated UI modules (`ProductsPage.tsx`, `InventoryDashboard.tsx`) to implement the `InventoryStateWrapper`. Adjusted model fields in rendering to align with proper AC structures (`price`, `description`, `quantity`, `order_number`).
- **Service Orders Alignment**: Upgraded the `consumeForOS` method parameter and standard interface to natively support receiving tracking variables such as `orderNumber`.

## Modified & New Files

- `.env` (Modified - Added variables context)
- `src/lib/supabase.ts` (New)
- `src/stores/useInventoryStore.tsx` (Rewritten)
- `src/components/admin/inventory/InventoryStateWrapper.tsx` (New)
- `src/pages/admin/inventory/ProductsPage.tsx` (Rewritten)
- `src/pages/admin/inventory/InventoryDashboard.tsx` (Rewritten)

## Supabase Queries Used

- `supabase.from('products').select('*').order('created_at', { ascending: false })`
- `supabase.from('inventory_balances').select('*')`
- `supabase.from('inventory_movements').select('*')`
- `supabase.from('inventory_requisitions').select('*')`
- Support endpoints: `insert`, `update`, `delete` standard execution logic over existing arrays.
