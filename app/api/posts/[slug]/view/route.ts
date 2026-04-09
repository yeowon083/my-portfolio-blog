import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.email === "yeowon083@gmail.com";

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, view_count, is_published")
    .eq("slug", slug)
    .single();

  if (error || !post || !post.is_published) {
    return NextResponse.json(
      { ok: false, message: "Post not found" },
      { status: 404 }
    );
  }

  if (isOwner) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq("id", post.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}