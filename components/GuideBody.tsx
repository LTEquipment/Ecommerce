import type { GuideBlock } from "@/lib/guides";

/**
 * Renders a guide's block content. Paragraph/callout HTML is static,
 * author-reviewed copy (limited to <a>/<strong>/<em>), not user input.
 */
export default function GuideBody({ body }: { body: GuideBlock[] }) {
  return (
    <>
      {body.map((b, i) => {
        if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.type === "ul") return <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
        if (b.type === "callout") return <div className="guide-callout" key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
      })}
    </>
  );
}
