# Wiring Supabase (later)

Right now the storefront runs on mock data in `lib/catalog.ts`. Nothing here is
active yet. When you're ready to connect the backend:

1. Create a Supabase project. Copy the project URL + anon key into `.env.local`
   (see `.env.example`). Keep the service-role key server-only.

2. Run `supabase/schema.sql` in the Supabase SQL editor to create the tables
   and RLS policies.

3. Point the data layer at Supabase — replace the bodies of `getCategories()`
   and `getProducts()` in `lib/catalog.ts`. Signatures stay the same, so no
   component changes:

   ```ts
   import { getSupabase } from "./supabase/client";

   export async function getProducts() {
     const supabase = getSupabase();
     const { data, error } = await supabase
       .from("products")
       .select("sku, name, category_id, base_price, images, specs, status");
     if (error) throw error;
     // map rows -> Product shape used by the UI
     return (data ?? []).map(mapRowToProduct);
   }
   ```

4. Feed the ERP → Supabase sync:
   - **Push (near real-time):** the ERP calls a Supabase Edge Function on
     product / price / stock changes, which upserts the rows (service-role key).
   - **Pull (reconcile):** a Vercel Cron or Supabase `pg_cron` job pulls the
     full catalog + inventory on a schedule to catch anything missed.

5. Orders flow back: on insert into `orders`, a Supabase Database Webhook fires
   an Edge Function that POSTs the order to the ERP; the ERP writes `erp_order_no`
   and `status` back.

6. Trade accounts + contract pricing: use Supabase Auth for sign-in and resolve
   the logged-in customer's `price_list_id` so contract prices override the
   standard list. RLS keeps each customer to their own prices and orders.
