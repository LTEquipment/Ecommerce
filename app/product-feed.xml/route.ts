import { getProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const revalidate = 3600; // regenerate hourly

const SITE = "https://www.ltfse.com";

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));
const abs = (u: string) => (u.startsWith("http") ? u : `${SITE}${u}`);

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace). Built entirely
 * from real catalog data — submit the URL to Merchant Center to enable Shopping
 * / free product listings. No GTINs, so identifier_exists=no with MPN=SKU.
 */
export async function GET() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);
  const { freightThreshold, freightFee } = settings;

  const items = products
    .map((p) => {
      const desc = (
        p.description ||
        `${p.name} — ${(p.brand ?? "Panda").replace(/[®™]/g, "").trim()} commercial kitchen equipment, model ${p.sku}. Built in New York, shipped nationwide.`
      ).slice(0, 4900);
      const imgs = (p.images ?? []).map(abs);
      const brand = (p.brand ?? "L&T").replace(/[®™]/g, "").trim();
      const freeFreight = p.price >= freightThreshold;
      const addl = imgs
        .slice(1, 11)
        .map((im) => `      <g:additional_image_link>${esc(im)}</g:additional_image_link>`)
        .join("\n");
      return [
        "    <item>",
        `      <g:id>${esc(p.sku)}</g:id>`,
        `      <g:title>${esc(p.name.slice(0, 150))}</g:title>`,
        `      <g:description>${esc(desc)}</g:description>`,
        `      <g:link>${SITE}/products/${esc(p.slug)}</g:link>`,
        imgs[0] ? `      <g:image_link>${esc(imgs[0])}</g:image_link>` : "",
        addl,
        `      <g:availability>${p.stock === "in" ? "in_stock" : "out_of_stock"}</g:availability>`,
        `      <g:price>${p.price.toFixed(2)} USD</g:price>`,
        p.was ? `      <g:sale_price>${p.price.toFixed(2)} USD</g:sale_price>` : "",
        "      <g:condition>new</g:condition>",
        `      <g:brand>${esc(brand)}</g:brand>`,
        `      <g:mpn>${esc(p.sku)}</g:mpn>`,
        "      <g:identifier_exists>no</g:identifier_exists>",
        "      <g:google_product_category>Business &amp; Industrial &gt; Food Service</g:google_product_category>",
        `      <g:product_type>${esc(p.cat)}</g:product_type>`,
        "      <g:shipping>",
        "        <g:country>US</g:country>",
        "        <g:service>Freight</g:service>",
        `        <g:price>${freeFreight ? "0.00" : freightFee.toFixed(2)} USD</g:price>`,
        "      </g:shipping>",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>L&amp;T Restaurant Equipment</title>
    <link>${SITE}</link>
    <description>Panda commercial kitchen equipment — designed and built in New York, shipped nationwide.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
