import type { ReactNode } from "react";

export type HeroStat = { value: string; label: string };

/**
 * Canonical editorial hero for the corporate/IR pages — the sustainability
 * poster treatment (red-rule kicker + oversized flat wordmark) on a solid ink
 * ground. Shared so the hero is identical across every page.
 */
export default function EditorialHero({
  kicker,
  title,
  lede,
  stats,
  image,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lede?: string;
  /** Optional stat foot rendered under the hero. */
  stats?: HeroStat[];
  /**
   * Optional full-bleed cover photo (path served from /public or an allowed
   * origin). Rendered as a CSS background under a scrim, so a missing file
   * degrades gracefully to the solid-ink hero rather than a broken image.
   */
  image?: string;
  /** CTAs (buttons/links) rendered under the lede. */
  children?: ReactNode;
}) {
  return (
    <section className={image ? "ed-hero has-photo" : "ed-hero"}>
      {image && (
        <>
          <div className="ed-hero-photo" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />
          <div className="ed-hero-scrim" aria-hidden="true" />
        </>
      )}
      <div className="wrap ed-hero-in">
        <span className="ed-kicker">{kicker}</span>
        <h1 className="ed-title">{title}</h1>
        {lede && <p className="ed-lede">{lede}</p>}
        {children && <div className="ed-cta">{children}</div>}
        {stats && stats.length > 0 && (
          <div className="ed-foot">
            {stats.map((s) => (
              <div className="f" key={s.label}>
                <div className="fn">{s.value}</div>
                <div className="fl">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
