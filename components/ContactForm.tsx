"use client";

import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ContactForm() {
  const { toast } = useStore();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  // Pre-fill when arriving from a careers "Express interest" link (/contact?role=Manufacturing).
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("role");
    if (r) {
      setRole(r);
      setF((s) => ({
        ...s,
        message: s.message || `I'd like to apply to the ${r} team. A bit about my background:\n\n`,
      }));
    }
  }, []);

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
      <h2 style={{ marginTop: 0 }}>{role ? `Apply — ${role}` : "Send us a message"}</h2>
      <div className="field-row">
        <div className="field"><label>Name</label><input required value={f.name} onChange={set("name")} /></div>
        <div className="field"><label>Company</label><input value={f.company} onChange={set("company")} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Email</label><input type="email" required value={f.email} onChange={set("email")} /></div>
        <div className="field"><label>Phone</label><input value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div className="field">
        <label>{role ? "Your background" : "How can we help?"}</label>
        <textarea rows={role ? 6 : 4} required value={f.message} onChange={set("message")} placeholder={role ? "Tell us about your experience and why you'd be a fit…" : "Tell us about your kitchen and what you're looking to spec…"} />
      </div>
      <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
        {busy ? "Sending…" : role ? "Submit application" : "Send message"}
      </button>
    </form>
  );
}
