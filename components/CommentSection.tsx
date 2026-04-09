"use client";

import { useEffect, useState } from "react";

type CommentTargetType = "post" | "project";

type CommentItem = {
  id: string;
  author_name: string;
  content: string;
  target_type: CommentTargetType;
  target_id: string;
  created_at: string;
};

type CommentSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CommentSection({
  targetType,
  targetId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorPassword, setAuthorPassword] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchComments() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/comments?targetType=${targetType}&targetId=${targetId}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "댓글을 불러오지 못했습니다.");
        setComments([]);
        setIsLoading(false);
        return;
      }

      setComments(data.comments ?? []);
      setIsLoading(false);
    } catch {
      setMessage("댓글을 불러오는 중 오류가 발생했습니다.");
      setComments([]);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const trimmedAuthorName = authorName.trim();
    const trimmedAuthorPassword = authorPassword.trim();
    const trimmedContent = content.trim();

    if (!trimmedAuthorName || !trimmedAuthorPassword || !trimmedContent) {
      setMessage("이름, 비밀번호, 댓글 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: trimmedAuthorName,
          authorPassword: trimmedAuthorPassword,
          content: trimmedContent,
          targetType,
          targetId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "댓글 저장에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      setAuthorName("");
      setAuthorPassword("");
      setContent("");
      setMessage("댓글이 등록되었습니다.");
      await fetchComments();
      setIsSubmitting(false);
    } catch {
      setMessage("댓글 저장 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">댓글</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={authorPassword}
              onChange={(e) => setAuthorPassword(e.target.value)}
              placeholder="수정/삭제용 비밀번호"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            댓글 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="댓글을 입력하세요"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        {message && <p className="text-sm text-gray-600">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
        >
          {isSubmitting ? "등록 중..." : "댓글 작성"}
        </button>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">댓글을 불러오는 중...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-3xl border border-gray-200 p-5"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <p className="font-semibold text-gray-900">
                  {comment.author_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>

              <p className="text-gray-700 leading-8 whitespace-pre-wrap">
                {comment.content}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}