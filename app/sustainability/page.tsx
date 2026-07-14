import PageShell from "@/components/PageShell";
import { Shield } from "@/components/icons";

export const metadata = { title: "Sustainability — L&T" };

export default function SustainabilityPage() {
  return (
    <PageShell
      title="Sustainability"
      eyebrow="Built to last"
      intro="Equipment that lasts decades, made close to the kitchens it serves — our approach to responsible manufacturing."
    >
      <div className="callout">
        <Shield />
        <p><strong>Made in New York.</strong> Local manufacturing means shorter supply chains and a smaller shipping footprint than imported equipment.</p>
      </div>

      <h2>Durable by design</h2>
      <p>
        The most sustainable equipment is the equipment you don&apos;t replace. Panda® ranges are
        built from heavy-gauge stainless steel and serviceable, repairable components — many of our
        customer relationships span 30+ years on the same line.
      </p>

      <h2>Energy &amp; efficiency</h2>
      <ul>
        <li>Energy Star–qualified models across cooking and refrigeration lines.</li>
        <li>High-efficiency jet burners and induction options that cut fuel use.</li>
        <li>R290 natural-refrigerant refrigeration with lower global-warming potential.</li>
      </ul>

      <h2>Materials &amp; end of life</h2>
      <ul>
        <li>Stainless steel is fully recyclable at end of life.</li>
        <li>Modular, interchangeable parts extend a unit&apos;s service life.</li>
        <li>Factory parts and service keep equipment running rather than landfilled.</li>
      </ul>

      <h2>Where we&apos;re headed</h2>
      <p>
        As we grow, we&apos;re formalizing our environmental reporting alongside our{" "}
        governance work. We&apos;ll publish measurable targets here as they&apos;re set.
      </p>
    </PageShell>
  );
}
