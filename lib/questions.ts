import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Question = {
  id: string;
  product_slug: string;
  author_name: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
  created_at: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function anonClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

/** Published questions for a product, newest first. Public. */
export async function getProductQuestions(slug: string): Promise<Question[]> {
  const sb = anonClient();
  if (!sb) return [];
  const { data } = await sb
    .from("product_questions")
    .select("id,product_slug,author_name,question,answer,answered_by,answered_at,created_at")
    .eq("product_slug", slug)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Question[]) ?? [];
}
