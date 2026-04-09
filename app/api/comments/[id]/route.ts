import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  let body: {
    authorPassword?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const authorPassword = body.authorPassword?.trim() ?? "";

  if (!authorPassword) {
    return NextResponse.json(
      { message: "비밀번호를 입력해주세요." },
      { status: 400 }
    );
  }

  const { data: comment, error: findError } = await supabase
    .from("comments")
    .select("id, author_password")
    .eq("id", id)
    .single();

  if (findError || !comment) {
    return NextResponse.json(
      { message: "댓글을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (comment.author_password !== authorPassword) {
    return NextResponse.json(
      { message: "비밀번호가 일치하지 않습니다." },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { message: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}