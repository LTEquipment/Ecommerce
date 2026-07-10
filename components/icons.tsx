import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const Search = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
);
export const User = (p: P) => (
  <svg {...base} strokeWidth={1.9} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const Cart = (p: P) => (
  <svg {...base} strokeWidth={1.9} {...p}><path d="M4 5h2l2.5 12h9l2-8H7" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
);
export const Menu = (p: P) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Plus = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const Close = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Filter = (p: P) => (
  <svg {...base} {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const Star = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.9 6.3 6.6.6-5 4.4 1.5 6.6L12 17l-5.9 3.5 1.5-6.6-5-4.4 6.6-.6z" /></svg>
);
export const Check = (p: P) => (
  <svg {...base} strokeWidth={3} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const Truck = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5" /><circle cx="7" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const Card = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M4 6h16v12H4z" /><path d="M4 10h16M8 15h4" /></svg>
);
export const Chat = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></svg>
);
