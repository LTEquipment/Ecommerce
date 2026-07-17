/**
 * CSV helpers that neutralize spreadsheet formula (CSV) injection. Untrusted
 * fields (company/ship_company/name/email/etc.) can start with =,+,-,@,tab or CR;
 * Excel/Sheets would then execute them as live formulas (HYPERLINK/WEBSERVICE/…)
 * when an admin opens the export. We prefix any such cell with an apostrophe
 * BEFORE RFC-4180 quoting, so it stays inert text.
 */
export function csvCell(value: unknown): string {
  const s = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Join a 2-D array of rows into an RFC-4180 CSV string with injection-safe cells. */
export function toCsv(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
