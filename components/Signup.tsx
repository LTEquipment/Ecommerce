"use client";

import { useStore } from "./StoreProvider";

export default function Signup() {
  const { toast } = useStore();
  return (
    <section className="signup">
      <div className="wrap">
        <div className="box">
          <div>
            <h3>Restock alerts &amp; contract pricing</h3>
            <p>New arrivals, clearance and volume price breaks — sent weekly.</p>
          </div>
          <div className="np">
            <input placeholder="you@yourkitchen.com" aria-label="Email" />
            <button onClick={() => toast("Subscribed. Check your inbox.")}>Subscribe</button>
          </div>
        </div>
      </div>
    </section>
  );
}
