import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { looksLikePdf, overSizeLimit } from "@/lib/uploadGuards";

const MAX = 20 * 1024 * 1024;

// Uploads a product document to the public "product-docs" bucket. PDF only —
// active content (HTML/SVG/XML) served inline from a public bucket is an XSS
// vector, so the type is verified by magic bytes and the stored Content-Type is
// pinned to application/pdf regardless of what the client claims.
// Service-role key (bypasses storage RLS) after verifying the caller is an admin.
export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (overSizeLimit(req, MAX)) return NextResponse.json({ error: "File must be under 20MB" }, { status: 413 });

  const form = await req.formData();
  const file = form.get("file");
  const slug = String(form.get("slug") || "misc").replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "misc";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File must be under 20MB" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikePdf(bytes)) return NextResponse.json({ error: "Only PDF documents are allowed" }, { status: 400 });

  const stamp = Math.random().toString(36).slice(2, 8);
  const path = `${slug}/${stamp}.pdf`;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await admin.storage.from("product-docs").upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from("product-docs").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
