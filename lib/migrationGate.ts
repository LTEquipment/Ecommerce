/**
 * Detects the "this migration hasn't been run" case.
 *
 * Schema ships as .sql files that are applied by hand (see supabase/MIGRATIONS.md),
 * so a panel can be querying a table or column that does not exist yet. PostgREST
 * reports that as a distinct error rather than an empty result — telling the two
 * apart is the difference between "nothing has happened yet" and "this feature is
 * switched off", which are very different things to show an operator.
 */
export type PgError = { code?: string; message?: string } | null | undefined;

export function isMissingRelation(err: PgError): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  // 42P01 undefined_table, 42703 undefined_column; PGRST20x are PostgREST's
  // schema-cache misses for the same thing.
  if (code === "42P01" || code === "42703" || code === "PGRST205" || code === "PGRST204") return true;
  const msg = (err.message ?? "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("could not find the table");
}
