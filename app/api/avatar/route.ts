import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { IMAGE_TYPES, overSizeLimit } from "@/lib/uploadGuards";

const MAX = 5 * 1024 * 1024;

// Uploads a profile photo to the public "avatars" bucket. Runs server-side with
// the service-role key (bypasses storage RLS) after verifying the signed-in user.
export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Reject oversized bodies before buffering (memory-DoS guard).
  if (overSizeLimit(req, MAX)) return NextResponse.json({ error: "Image must be under 5MB" }, { status: 413 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  // Raster images only — SVG/active content is not allowed in a public bucket.
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, WEBP, GIF or AVIF image" }, { status: 400 });

  const path = `${user.id}/avatar.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await admin.storage.from("avatars").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}` });
}
