import { getSiteSettings } from "@/lib/settings";

/**
 * Site-wide announcement bar (promotions, holiday hours, etc.), driven by the
 * admin-editable `announcement` site setting. Renders nothing when it's blank,
 * so it stays out of the way until staff set a message.
 */
export default async function AnnouncementBanner() {
  const { announcement } = await getSiteSettings();
  const text = announcement?.trim();
  if (!text) return null;
  return (
    <div className="announce" role="region" aria-label="Store announcement">
      <div className="wrap announce-in">{text}</div>
    </div>
  );
}
