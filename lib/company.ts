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
  locations: [
    {
      kind: "Factory & HQ",
      name: "L&T Restaurant Equipment Inc.",
      address: "280 Taylor St, Staten Island, NY 10310",
      phone: "(917) 204-1697",
    },
    {
      kind: "Warehouse",
      name: "Pioneer Enterprise of America LLC",
      address: "63 Veronica Ave, Unit B, Somerset, NJ 08873",
      phone: "(732) 875-3130",
    },
    {
      kind: "Showroom",
      name: "L&T Restaurant Supply",
      address: "6814 Bay Pkwy, Brooklyn, NY 11204",
      phone: "(315) 895-6260",
    },
    {
      kind: "Showroom",
      name: "TP Group of USA Inc.",
      address: "134-38 33rd Ave, 1st Floor, Flushing, NY 11354",
      phone: "(718) 886-9776",
    },
  ] as Location[],
};

/** "(917) 204-1697" -> "+19172041697" for tel: links */
export const telHref = (phone: string): string =>
  "tel:+1" + phone.replace(/\D/g, "");
