import { Star } from "./icons";

/** A 5-star rating display. Filled stars use ink; empty stars are a light rule. */
export default function Stars({ value, size = 15 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="stars-row" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= filled ? "on" : "off"}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}
