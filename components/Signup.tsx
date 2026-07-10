"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function Signup() {
  const { toast } = useStore();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    const sb = getBrowserSupabase();
    if (sb) {
      const { error } = await sb.from("subscribers").upsert({ email }, { onConflict: "email" });
      if (error && !/duplicate|conflict/i.test(error.message)) {
        setBusy(false);
        toast(`Couldn't subscribe: ${error.message}`);
        return;
      }
    }
    setBusy(false);
    setEmail("");
    toast("Subscribed. Check your inbox.");
  };

  return (
    <section className="signup">
      <div className="wrap">
        <div className="box">
          <div>
            <h3>Restock alerts &amp; contract pricing</h3>
            <p>New arrivals, clearance and volume price breaks — sent weekly.</p>
          </div>
          <form className="np" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="you@yourkitchen.com"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
