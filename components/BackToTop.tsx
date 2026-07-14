"use client";

/** "Back to Top" pill — lives in the footer support bar, smooth-scrolls to top. */
export default function BackToTop() {
  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V6M6 12l6-6 6 6" />
      </svg>
      Back to Top
    </button>
  );
}
