"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";

export default function ContactForm() {
  const { toast } = useStore();
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast("Thanks — we'll be in touch shortly.");
  };

  if (sent) {
    return (
      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>Message sent</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
          Thanks for reaching out. A member of our team will follow up within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Send us a message</h2>
      <div className="field-row">
        <div className="field"><label>Name</label><input required /></div>
        <div className="field"><label>Company</label><input /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Email</label><input type="email" required /></div>
        <div className="field"><label>Phone</label><input /></div>
      </div>
      <div className="field"><label>How can we help?</label><textarea rows={4} required placeholder="Tell us about your kitchen and what you're looking to spec…" /></div>
      <button className="btn btn-primary btn-lg" type="submit">Send message</button>
    </form>
  );
}
