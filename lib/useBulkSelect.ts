"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Selection state for an admin list. Ids are kept rather than rows so a
 * selection survives paging, filtering and a background refresh — selecting
 * five orders, paging on, then acting still applies to all five.
 *
 * `pageIds` is the currently visible page: "select all" is scoped to what the
 * operator can actually see, which is what every admin list does. Acting on
 * rows you cannot see is how bulk mistakes happen.
 */
export function useBulkSelect(pageIds: string[]) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allOnPage = pageIds.length > 0 && pageIds.every((id) => ids.has(id));
  const someOnPage = !allOnPage && pageIds.some((id) => ids.has(id));

  const toggleAll = useCallback(() => {
    setIds((prev) => {
      const next = new Set(prev);
      const every = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      for (const id of pageIds) {
        if (every) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [pageIds]);

  const clear = useCallback(() => setIds(new Set()), []);

  /** Drop ids that no longer exist (deleted, or filtered out server-side). */
  const prune = useCallback((existing: string[]) => {
    const keep = new Set(existing);
    setIds((prev) => new Set([...prev].filter((id) => keep.has(id))));
  }, []);

  return useMemo(
    () => ({ ids, count: ids.size, has: (id: string) => ids.has(id), toggle, toggleAll, clear, prune, allOnPage, someOnPage }),
    [ids, toggle, toggleAll, clear, prune, allOnPage, someOnPage]
  );
}
