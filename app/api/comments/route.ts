import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CommentTargetType = "post" | "project";

function isValidTargetType(value: string): value is CommentTargetType {
  return value === "post" || value === "project";
}

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType") ?? "";
  const targetId = searchParams.get("targetId") ?? "";

  if (!isValidTargetType(targetType)) {
    return NextResponse.json(
      { message: "targetType은 post 또는 project여야 합니다." },
      { status: 400 }
    );
  }

  if (!targetId.trim()) {
    return NextResponse.json(
      { message: "targetId가 필요합니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, content, target_type, target_id, created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: "댓글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  let body: {
    authorName?: string;
    authorPassword?: string;
    content?: string;
    targetType?: string;
    targetId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const authorName = body.authorName?.trim() ?? "";
  const authorPassword = body.authorPassword?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  const targetType = body.targetType?.trim() ?? "";
  const targetId = body.targetId?.trim() ?? "";

  if (!authorName || !authorPassword || !content || !targetId) {
    return NextResponse.json(
      { message: "이름, 비밀번호, 댓글 내용, targetId는 필수입니다." },
      { status: 400 }
    );
  }

  if (!isValidTargetType(targetType)) {
    return NextResponse.json(
      { message: "targetType은 post 또는 project여야 합니다." },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(authorPassword);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      author_name: authorName,
      author_password: hashedPassword,
      content,
      target_type: targetType,
      target_id: targetId,
    })
    .select("id, author_name, content, target_type, target_id, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { message: `댓글 저장 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}