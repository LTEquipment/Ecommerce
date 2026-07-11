export type Location = {
  kind: string;
  name: string;
  address: string;
  phone: string;
};

export const COMPANY = {
  brand: "L&T",
  legalName: "L&T Restaurant Equipment Inc.",
  hqAddress: "280 Taylor St, Staten Island, NY 10310",
  mainPhone: "(917) 204-1697",
  altPhone: "(718) 567-8658",
  email: "customer@ltfse.com",
  locations: [
    {
      kind: "Corporate HQ & Factory",
      name: "L&T Restaurant Equipment Inc.",
      address: "280 Taylor St, Staten Island, NY 10310",
      phone: "(917) 204-1697",
    },
    {
      kind: "Showroom",
      name: "Manhattan Showroom",
      address: "62 Allen St, New York, NY 10002",
      phone: "(917) 204-1697",
    },
    {
      kind: "Showroom",
      name: "Brooklyn Showroom",
      address: "6816 Bay Parkway, Brooklyn, NY 11204",
      phone: "(718) 567-8658",
    },
    {
      kind: "Showroom",
      name: "Flushing Showroom",
      address: "134-38 33rd Ave, Flushing, NY 11354",
      phone: "(917) 204-1697",
    },
  ] as Location[],
};

/** Official L&T / Panda social profiles (tracking params stripped). */
export const SOCIALS = [
  { name: "TikTok", href: "https://www.tiktok.com/@ltusa.net" },
  { name: "Facebook", href: "https://www.facebook.com/p/LT-Restaurant-Equipment-Inc-61558406247428/" },
  { name: "Pinterest", href: "https://www.pinterest.com/ltrestauran_inc/" },
  { name: "X", href: "https://x.com/ltrestauran_inc" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCv-EDGBVBIRzW0UgB-kiV0Q" },
  { name: "Xiaohongshu", href: "https://www.xiaohongshu.com/user/profile/6661c3e20000000007007b5f" },
] as const;

/** "(917) 204-1697" -> "+19172041697" for tel: links */
export const telHref = (phone: string): string =>
  "tel:+1" + phone.replace(/\D/g, "");
