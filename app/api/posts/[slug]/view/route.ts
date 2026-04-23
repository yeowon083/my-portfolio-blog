import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10;

async function getPostViewCookieName(slug: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(slug);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);

  return `post_viewed_${hash}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const cookieName = await getPostViewCookieName(slug);

  if (request.cookies.has(cookieName)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

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

  const response = NextResponse.json({ ok: true });

  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    maxAge: VIEW_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
