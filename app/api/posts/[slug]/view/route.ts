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
    .select("id, is_published")
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

  const { error: rpcError } = await supabase.rpc("increment_post_view", {
    p_slug: slug,
  });

  if (rpcError) {
    return NextResponse.json(
      { ok: false, message: rpcError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}