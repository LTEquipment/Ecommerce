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
export const ChevronDown = (p: P) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const Package = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></svg>
);
export const LogOut = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M15 4h4v16h-4" /><path d="M10 12h9M15 8l4 4-4 4" /><path d="M10 4H5v16h5" /></svg>
);
export const MapPin = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M4 5c0 8 7 15 15 15l-2-4-4 1-6-6 1-4z" /></svg>
);
export const Mail = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const Clock = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const TrendingUp = (p: P) => (
  <svg {...base} strokeWidth={1.9} {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
);
export const FileText = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4M9 13h6M9 17h6" /></svg>
);
export const LinkedIn = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4z" /></svg>
);
export const Instagram = (p: P) => (
  <svg {...base} strokeWidth={1.8} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
export const XSocial = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.9 2H22l-7.1 8.1L23 22h-6.8l-5-6.6L5.4 22H2.3l7.6-8.7L1.7 2h6.9l4.5 6zm-1.2 18h1.7L7.4 3.8H5.6z" /></svg>
);
export const Facebook = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" /></svg>
);
export const TikTok = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.6 5.8a4.7 4.7 0 0 1-3.3-4.3h-3.1v12.6a2.7 2.7 0 1 1-2.7-2.7c.2 0 .5 0 .7.1V8.3a5.9 5.9 0 0 0-.7 0 5.7 5.7 0 1 0 5.7 5.7V8.6a7.7 7.7 0 0 0 4.4 1.4V6.9c-.4 0-.7 0-1-.1z" /></svg>
);
export const Pinterest = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.7 6 9.2-.1-.8-.2-2 0-2.8l1.1-4.8s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2 1 .5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.8 0-2-1.3-3.4-3.7-3.4-2.7 0-4.4 2-4.4 4.3 0 .8.3 1.4.7 1.8.1.2.2.3.1.5l-.2.8c-.1.3-.3.4-.5.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.2-5.8 6.7-5.8 3.5 0 5.9 2.6 5.9 5.3 0 3.6-2 6.4-5 6.4-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.8-.7 1.7-1.1 2.3.8.3 1.7.4 2.6.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" /></svg>
);
export const Youtube = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4l6.3 3.6z" /></svg>
);
export const Xiaohongshu = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 6.5C10 5.2 7 5 4.5 5.7v12c2.5-.7 5.5-.5 7.5.8 2-1.3 5-1.5 7.5-.8v-12C17 5 14 5.2 12 6.5z" /><path d="M12 6.5V19" /></svg>
);
