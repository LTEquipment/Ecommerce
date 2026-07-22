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

# Dependency order. erp-order-queue must come after guest-orders and
# b2b-checkout: the replay sweep reads guest_email and po_number when it
# rebuilds an order, and a replay missing them would send the ERP a different
# order than the first attempt did.
FILES = [
    "guest-orders.sql",
    "b2b-checkout.sql",
    "payments.sql",
    "erp-order-queue.sql",
]

HEADER = """-- =====================================================================
-- L&T storefront — run this whole file in the Supabase SQL editor.
--
--   PROJECT: mrfcfjsmossulfrbwoml   (the storefront)
--   NOT:     lhqijcgxhygepjnbccxu   (the ERP — it has its own `orders`
--            table with different columns, and payments.sql below would
--            rewrite real order data there. Check the project name in the
--            Supabase header before you paste.)
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
    parts = [HEADER.format(names=", ".join(FILES))]
    for name in FILES:
        body = (root / name).read_text().rstrip()
        parts.append(f"\n-- ==================== {name} ====================\n\n{body}\n")
    out = "".join(parts)
    target = root / "RUN-ALL-orders.sql"
    target.write_text(out)
    print(f"wrote {target.relative_to(root.parent)} ({len(out.splitlines())} lines)")


if __name__ == "__main__":
    main()
