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
  email: "customer@ekitchensupply.com",
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

/** "(917) 204-1697" -> "+19172041697" for tel: links */
export const telHref = (phone: string): string =>
  "tel:+1" + phone.replace(/\D/g, "");
