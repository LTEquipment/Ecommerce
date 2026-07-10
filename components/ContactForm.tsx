"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ContactForm() {
  const { toast } = useStore();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const sb = getBrowserSupabase();
    if (sb) {
      const { error } = await sb.from("contact_messages").insert(f);
      if (error) {
        setBusy(false);
        toast(`Couldn't send: ${error.message}`);
        return;
      }
    }
    setBusy(false);
    setSent(true);
    toast("Thanks — we'll be in touch shortly.");
  };

  if (sent) {
    return (
      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>Message sent</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
          Thanks for reaching out{f.name ? `, ${f.name}` : ""}. A member of our team will follow up
          within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Send us a message</h2>
      <div className="field-row">
        <div className="field"><label>Name</label><input required value={f.name} onChange={set("name")} /></div>
        <div className="field"><label>Company</label><input value={f.company} onChange={set("company")} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Email</label><input type="email" required value={f.email} onChange={set("email")} /></div>
        <div className="field"><label>Phone</label><input value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div className="field">
        <label>How can we help?</label>
        <textarea rows={4} required value={f.message} onChange={set("message")} placeholder="Tell us about your kitchen and what you're looking to spec…" />
      </div>
      <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
