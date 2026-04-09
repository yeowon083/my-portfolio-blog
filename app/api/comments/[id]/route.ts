import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  let body: {
    authorPassword?: string;
    adminMode?: boolean;
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
  const adminMode = body.adminMode === true;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user && user.email === "yeowon083@gmail.com";

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

  if (adminMode) {
    if (!isAdmin) {
      return NextResponse.json(
        { message: "관리자 권한이 없습니다." },
        { status: 403 }
      );
    }
  } else {
    if (!authorPassword) {
      return NextResponse.json(
        { message: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(authorPassword);

    if (comment.author_password !== hashedPassword) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  let body: {
    authorPassword?: string;
    content?: string;
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
  const content = body.content?.trim() ?? "";

  if (!authorPassword || !content) {
    return NextResponse.json(
      { message: "비밀번호와 수정할 댓글 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(authorPassword);

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

  if (comment.author_password !== hashedPassword) {
    return NextResponse.json(
      { message: "비밀번호가 일치하지 않습니다." },
      { status: 403 }
    );
  }

  const { data: updatedComment, error: updateError } = await supabase
    .from("comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, author_name, content, target_type, target_id, created_at, updated_at"
    )
    .single();

  if (updateError) {
    return NextResponse.json(
      { message: "댓글 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ comment: updatedComment });
}