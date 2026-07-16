import { COMPANY, SOCIALS } from "./company";
import type { Product } from "./types";
import type { Review, ReviewStats } from "./reviews";

export const SITE = "https://www.ltfse.com";
const ORG_ID = `${SITE}/#organization`;
const abs = (u: string) => (u.startsWith("http") ? u : `${SITE}${u}`);

/** Organization / company entity — publisher of everything on the site. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: COMPANY.legalName,
    alternateName: "L&T Restaurant Equipment",
    url: SITE,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/logo.png`,
    email: COMPANY.email,
    telephone: COMPANY.mainPhone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "280 Taylor St",
      addressLocality: "Staten Island",
      addressRegion: "NY",
      postalCode: "10310",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY.mainPhone,
      email: COMPANY.email,
      contactType: "sales",
      areaServed: "US",
    },
    sameAs: SOCIALS.map((s) => s.href),
  };
}

/** WebSite entity + sitelinks searchbox (points at the URL-addressable /products?q=). */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "L&T Restaurant Equipment",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList — items with a name and (except the current page) an absolute url. */
export function breadcrumbLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: abs(it.url) } : {}),
    })),
  };
}

/**
 * Product schema. aggregateRating/review are emitted ONLY when real, verified
 * reviews exist (stats.count > 0) — never fabricated. When a product has no
 * reviews these fields are omitted entirely, which is what keeps the markup safe
 * from a Google manual action.
 */
export function productLd(
  p: Product,
  categoryName?: string,
  stats?: ReviewStats | null,
  reviews?: Review[]
) {
  const url = `${SITE}/products/${p.slug}`;
  const images = (p.images ?? []).map(abs);
  // Real policy terms (see /shipping, /returns): free freight over $999 else $89;
  // 30-day returns on unused stock, customer pays return freight; in-stock ships 24–48h.
  const freeFreight = p.price >= 999;
  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  const specProps = Object.entries(p.specs ?? {})
    .slice(0, 30)
    .map(([name, value]) => ({ "@type": "PropertyValue", name, value: String(value) }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    mpn: p.sku,
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand.replace(/®/g, "").trim() } } : {}),
    ...(images.length ? { image: images } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    ...(specProps.length ? { additionalProperty: specProps } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: p.price.toFixed(2),
      priceValidUntil,
      availability: p.stock === "in" ? "https://schema.org/InStock" : "https://schema.org/BackOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: freeFreight ? "0" : "89", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
    // Real reviews only — omitted when a product has none.
    ...(stats && stats.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stats.avg.toFixed(1),
            reviewCount: stats.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews && reviews.length
      ? {
          review: reviews.slice(0, 8).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { "@type": "Person", name: r.author_name },
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.body,
            datePublished: r.created_at.slice(0, 10),
          })),
        }
      : {}),
  };
}

/** Brand entity for a brand landing page. */
export function brandLd(name: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${SITE}/brands/${slug}#brand`,
    name: name.replace(/[®™]/g, "").trim(),
    url: `${SITE}/brands/${slug}`,
  };
}

/** ItemList for a category / collection page. */
export function itemListLd(products: Product[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/products/${p.slug}`,
      name: p.name,
    })),
  };
}

/** One Store node per physical showroom / factory. */
export function storesLd() {
  return COMPANY.locations.map((loc, i) => ({
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE}/locations#loc-${i}`,
    name: `${COMPANY.brand} — ${loc.name}`,
    parentOrganization: { "@id": ORG_ID },
    address: { "@type": "PostalAddress", streetAddress: loc.address, addressCountry: "US" },
    telephone: loc.phone,
    geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
    url: `${SITE}/locations`,
  }));
}

/** Article schema for a buyer guide. */
export function articleLd(g: { slug: string; title: string; excerpt: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.excerpt,
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: `${SITE}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/guides/${g.slug}` },
  };
}

/** FAQPage — content must be visible on the page (it is, in <details>). */
export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
