# Admin sale editing and inactivity

Implemented on develop without a database migration. No definition of `update_sale`
exists in this checkout; the deployed database has not been inspected. Create or
verify this RPC before final integration testing. No direct sale/inventory updates
or unsafe fallback are used for editing.

## Exact frontend RPC contract

Supabase call: `rpc("update_sale", parameters)` with all nine named arguments:

| Argument | Expected PostgreSQL type / value |
| --- | --- |
| p_sale_id | Same type as public.sales.id; original ID, unchanged |
| p_product_sku | text; SKU of selected MX product |
| p_buyer_name | text; trimmed, nonempty |
| p_quantity | integer; >= 1 |
| p_unit_price | integer; >= 0, existing MXN price units |
| p_payment_status | text; pending or paid |
| p_expected_payment_date | date; ISO YYYY-MM-DD or null, optional even for pending |
| p_sold_by | text or null; trimmed, optional as in registration |
| p_notes | text or null; trimmed |

Success: no Supabase error; return the updated sale row (the frontend currently
ignores the payload and reloads sales and inventory). Failure: raise a database
error and roll back the entire operation. Missing RPC (PGRST202) receives a specific
Spanish configuration message. Other failures preserve form values and show a
Spanish error. No optimistic inventory changes occur.

Required database implementation:

1. Require an authenticated administrator using the application's authoritative
   admin authorization policy; authentication alone is insufficient. Restrict
   EXECUTE and use a safe search_path if SECURITY DEFINER is needed.
2. Lock the sale FOR UPDATE; reject missing, non-MX or cancelled sales.
3. Validate inputs server-side, keeping id and created_at unchanged.
4. Lock the old and new market_products rows for market MX in deterministic SKU
   order. Reject missing rows. Determine old SKU and quantity from the locked sale.
5. Restore old quantity to old stock, validate new quantity against stock after
   restoration, then subtract new quantity. For an unchanged SKU use its restored
   stock. All writes must be in the same transaction; stock must never be negative.
   If SKU and quantity are unchanged, leave stock unchanged.
6. Update all editable fields. pending -> paid sets paid_at to database now();
   paid -> pending clears paid_at. Preserve paid_at for paid -> paid.
7. Return the updated sale; any failure rolls back both sale and stock writes.

Integration cases to verify once the RPC is available: same-product 2 -> 1 returns
one unit; A/1 -> B/1 returns one A and subtracts one B; metadata-only edit leaves
stock unchanged; insufficient stock and cancelled/non-MX/unauthorized edits fail
without changes; concurrent edits cannot oversell; both payment transitions work.

## Session behavior

The Admin-only hook watches mousemove, mousedown, click, keydown, captured scroll,
and touchstart. At 28 idle minutes it displays the existing Kinora notice style;
activity clears the notice and resets the deadline. At 30 idle minutes AdminPage
clears its session, sales and inventory and calls supabase.auth.signOut(), returning
to AdminLogin without a reload. A local sign-out is attempted if remote sign-out
fails. A server/network failure cannot guarantee server-side token revocation.

One scheduled timer is active at a time. Token refreshes do not reset activity;
login starts a fresh period. Focus/visibility changes check elapsed time so a
suspended tab expires on resume. Listeners and timers are removed on unmount or
session loss. Timestamps remain only in memory. Existing admin access checks are
unchanged; the backend must enforce administrator authorization.
