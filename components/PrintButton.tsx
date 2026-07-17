"use client";

/** Screen-only button that prints the current page (the print stylesheet isolates
 *  the order receipt into a clean invoice for Save-as-PDF / paper). */
export default function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-line btn-sm receipt-print-btn no-print" onClick={() => window.print()}>
      {label}
    </button>
  );
}
