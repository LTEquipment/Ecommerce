import { Shield } from "../icons";

/**
 * Shown when a panel's table or column isn't there yet. The default empty state
 * ("No activity yet") reads as "nothing has happened", which is misleading when
 * the truth is that nothing is being *recorded* — so this says so plainly and
 * names the file to run.
 */
export default function MigrationNotice({
  feature,
  file,
  consequence,
}: {
  /** What is switched off, e.g. "The audit log". */
  feature: string;
  /** Filename inside supabase/, e.g. "audit-log.sql". */
  file: string;
  /** What is being lost meanwhile, e.g. "admin actions aren't being recorded". */
  consequence: string;
}) {
  return (
    <div className="emptybox migration-off">
      <Shield />
      <div className="m">{feature} isn&rsquo;t enabled yet</div>
      <div className="s">
        Run <code>supabase/{file}</code> in the Supabase SQL editor to turn it on. Until then{" "}
        {consequence} — this panel stays empty whatever happens in the store.
      </div>
    </div>
  );
}
