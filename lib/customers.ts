export type Customer = { name: string; slug: string };

/**
 * Operators, venues and distributors that run on L&T / Panda® equipment.
 * Each logo is served from /public/customers/<slug>.png — see
 * public/customers/README.md for the filename mapping. Until a file exists the
 * cell falls back to a clean text nameplate, so the wall always looks finished.
 */
export const CUSTOMERS: Customer[] = [
  { name: "Cheli", slug: "cheli" },
  { name: "Shoo Loong Kan", slug: "shoo-loong-kan" },
  { name: "Tai Er", slug: "tai-er" },
  { name: "Quanjude", slug: "quanjude" },
  { name: "Meizhou Dongpo", slug: "meizhou-dongpo" },
  { name: "Juqi", slug: "juqi" },
  { name: "Jiumaojiu Group", slug: "jiumaojiu" },
  { name: "Jiang Nan", slug: "jiang-nan" },
  { name: "Din Tai Fung", slug: "din-tai-fung" },
  { name: "Da Dong", slug: "da-dong" },
  { name: "Youqing Kechuan", slug: "youqing-kechuan" },
  { name: "Xi'an Famous Foods", slug: "xian-famous-foods" },
  { name: "Wegmans", slug: "wegmans" },
  { name: "UMass Amherst", slug: "umass-amherst" },
  { name: "TriMark", slug: "trimark" },
  { name: "The Venetian", slug: "the-venetian" },
  { name: "Tao Group Hospitality", slug: "tao-group" },
  { name: "Szechuan Mountain House", slug: "szechuan-mountain-house" },
  { name: "Spice World", slug: "spice-world" },
  { name: "Singer EVI", slug: "singer-evi" },
  { name: "Sam Tell Companies", slug: "sam-tell" },
  { name: "Resorts World Casino", slug: "resorts-world" },
  { name: "Orbital", slug: "orbital" },
  { name: "Philippe Chow", slug: "philippe-chow" },
  { name: "Panda Express", slug: "panda-express" },
  { name: "Nom Wah", slug: "nom-wah" },
  { name: "Nan Xiang Xiao Long Bao", slug: "nan-xiang" },
  { name: "Little Sheep Hot Pot", slug: "little-sheep" },
  { name: "MGM Grand", slug: "mgm-grand" },
  { name: "Joe's Shanghai", slug: "joes-shanghai" },
  { name: "InnoTech Construction", slug: "innotech" },
  { name: "Hawaiian Bros", slug: "hawaiian-bros" },
  { name: "Haidilao Hot Pot", slug: "haidilao" },
  { name: "Good Harvest", slug: "good-harvest" },
  { name: "Fuyao Group", slug: "fuyao" },
  { name: "De Chang Company", slug: "de-chang" },
  { name: "Don", slug: "don" },
  { name: "Chongqing Liuyishou Hotpot", slug: "chongqing-liuyishou" },
];
