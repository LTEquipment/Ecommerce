/**
 * Renders a schema.org JSON-LD block. `<` is escaped so nothing in the data
 * (product names, descriptions) can break out of the <script> element.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
