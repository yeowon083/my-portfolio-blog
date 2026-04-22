import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "yeowon083@gmail.com";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  const countOnly = searchParams.get("countOnly") === "true";

  let query = supabase
    .from("comments")
    .select("id, author_name, content, target_type, target_id, created_at, parent_id", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (since) {
    query = query.gt("created_at", since);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { message: "댓글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  if (countOnly) {
    return NextResponse.json({ count: count ?? 0 });
  }

  return NextResponse.json({ comments: data ?? [], count: count ?? 0 });
}
