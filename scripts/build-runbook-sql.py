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
# audit-log leads. It is not a dark panel: marking an order paid calls
# logAudit() right beside the write, and with no table that call is a no-op —
# verified by marking a $48,599.62 order paid and finding no record of who did
# it. Financial state changing with nothing to attribute it to is a different
# class of problem from a feature being switched off. It is also the audit
# trail the ERP reconciliation endpoint has nowhere to write to.
BATCH_2 = [
    "audit-log.sql",
    "quote-convert-idempotency.sql",
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
