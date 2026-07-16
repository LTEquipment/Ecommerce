import { GUIDES, type Guide } from "./guides";

const STOP = new Set(["and", "the", "for", "with", "your", "kitchen", "commercial", "equipment"]);

/**
 * Guides most relevant to a free-text query (category or product name), scored by
 * shared keywords against each guide's title + excerpt. Enables category/product
 * pages to link into the guides — the internal-linking direction that was missing.
 */
export function relatedGuides(query: string, limit = 3): Guide[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3 && !STOP.has(t));
  if (tokens.length === 0) return [];
  return GUIDES.map((g) => {
    const hay = `${g.title} ${g.excerpt} ${g.category}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score++;
    return { g, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.g);
}
