#!/usr/bin/env python3
"""Concatenate the order-critical migrations into one paste-ready file.

Why this exists: the runbook used to say "open these four files and paste each
one". The only copy-pasteable SQL in the document was the verification query and
the test-order delete, so those got run and the four migrations did not. Telling
someone to go and assemble something themselves is a step that quietly does not
happen.

Generating it rather than hand-copying keeps the single source of truth in the
individual .sql files and removes any chance of a transcription error.

Usage:  python3 scripts/build-runbook-sql.py
"""

import pathlib

# Batch 1 — order-critical. Dependency order: erp-order-queue must come after
# guest-orders and b2b-checkout, because the replay sweep reads guest_email and
# po_number when it rebuilds an order, and a replay missing them would send the
# ERP a different order than the first attempt did.
BATCH_1 = [
    "guest-orders.sql",
    "b2b-checkout.sql",
    "payments.sql",
    "erp-order-queue.sql",
]

# Batch 2 — everything else, most-valuable first rather than alphabetically.
# quote-convert-idempotency leads because it is a correctness bug (a double
# click on "Create order from quote" can produce two orders) rather than a
# feature that is merely switched off. audit-log is next: the ERP
# reconciliation endpoint currently has no audit table to write to, so customer
# data leaves the system with only a console line behind it.
BATCH_2 = [
    "quote-convert-idempotency.sql",
    "audit-log.sql",
    "admin-catalog.sql",
    "product-docs.sql",
    "product-reviews.sql",
    "saved-lists.sql",
    "account-deletion.sql",
]

BATCHES = [("RUN-ALL-orders.sql", BATCH_1), ("RUN-ALL-remaining.sql", BATCH_2)]

HEADER = """-- =====================================================================
-- L&T storefront — run this whole file in the Supabase SQL editor.
--
--   PROJECT: mrfcfjsmossulfrbwoml   (the storefront)
--   NOT:     lhqijcgxhygepjnbccxu   (the ERP — it has its own `orders` and
--            `products` tables with different columns, so these statements
--            would succeed there and graft storefront columns onto real ERP
--            data. Check the project name in the Supabase header first.)
--
-- GENERATED — do not edit. This is {names} concatenated in dependency order
-- by scripts/build-runbook-sql.py. Edit those files and regenerate; anything
-- typed here is lost on the next build.
--
-- Safe to re-run: every statement is `if not exists` or an idempotent
-- update, so a partial run is fixed by running the whole thing again.
-- =====================================================================

"""

def main() -> None:
    root = pathlib.Path(__file__).resolve().parent.parent / "supabase"
    for target_name, files in BATCHES:
        parts = [HEADER.format(names=", ".join(files))]
        for name in files:
            body = (root / name).read_text().rstrip()
            parts.append(f"\n-- ==================== {name} ====================\n\n{body}\n")
        out = "".join(parts)
        target = root / target_name
        target.write_text(out)
        print(f"wrote {target.relative_to(root.parent)} ({len(out.splitlines())} lines)")


if __name__ == "__main__":
    main()
