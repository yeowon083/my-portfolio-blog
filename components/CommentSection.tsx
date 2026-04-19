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
  updated_at?: string;
};

type CommentSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
  isAdmin?: boolean;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const MY_COMMENTS_KEY = "my_comment_ids";

function getMyCommentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_COMMENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addMyCommentId(id: string) {
  const ids = getMyCommentIds();
  if (!ids.includes(id)) {
    localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify([...ids, id]));
  }
}

function removeMyCommentId(id: string) {
  const ids = getMyCommentIds().filter((i) => i !== id);
  localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(ids));
}

export default function CommentSection({
  targetType,
  targetId,
  isAdmin = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorPassword, setAuthorPassword] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 내가 작성한 댓글 ID 목록
  const [myCommentIds, setMyCommentIds] = useState<string[]>([]);

  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [editCommentId, setEditCommentId] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // ✅ 마운트 시 localStorage에서 내 댓글 ID 불러오기
  useEffect(() => {
    setMyCommentIds(getMyCommentIds());
  }, []);

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
        headers: { "Content-Type": "application/json" },
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

      // ✅ 작성 성공 시 댓글 ID를 localStorage에 저장
      const newId = data.comment?.id;
      if (newId) {
        addMyCommentId(newId);
        setMyCommentIds(getMyCommentIds());
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

  async function handleDelete(commentId: string) {
    const trimmedPassword = deletePassword.trim();
    if (!trimmedPassword) {
      setMessage("삭제 비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorPassword: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "댓글 삭제에 실패했습니다.");
        setIsDeleting(false);
        return;
      }

      // ✅ 삭제 성공 시 localStorage에서도 제거
      removeMyCommentId(commentId);
      setMyCommentIds(getMyCommentIds());

      setMessage("댓글이 삭제되었습니다.");
      setDeleteCommentId("");
      setDeletePassword("");
      await fetchComments();
      setIsDeleting(false);
    } catch {
      setMessage("댓글 삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  }

  async function handleAdminDelete(commentId: string) {
    const ok = window.confirm("관리자 권한으로 이 댓글을 삭제할까요?");
    if (!ok) return;

    setIsDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMode: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "관리자 삭제에 실패했습니다.");
        setIsDeleting(false);
        return;
      }

      removeMyCommentId(commentId);
      setMyCommentIds(getMyCommentIds());

      setMessage("댓글이 삭제되었습니다.");
      setDeleteCommentId("");
      setDeletePassword("");
      await fetchComments();
      setIsDeleting(false);
    } catch {
      setMessage("댓글 삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  }

  async function handleEdit(commentId: string) {
    const trimmedPassword = editPassword.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedPassword || !trimmedContent) {
      setMessage("수정 비밀번호와 댓글 내용을 입력해주세요.");
      return;
    }

    setIsEditing(true);
    setMessage("");

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorPassword: trimmedPassword,
          content: trimmedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "댓글 수정에 실패했습니다.");
        setIsEditing(false);
        return;
      }

      setMessage("댓글이 수정되었습니다.");
      setEditCommentId("");
      setEditPassword("");
      setEditContent("");
      await fetchComments();
      setIsEditing(false);
    } catch {
      setMessage("댓글 수정 중 오류가 발생했습니다.");
      setIsEditing(false);
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
          comments.map((comment) => {
            // ✅ 내가 쓴 댓글인지 확인
            const isMine = myCommentIds.includes(comment.id);

            return (
              <article
                key={comment.id}
                className="rounded-3xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-gray-900">
                      {comment.author_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                      {comment.updated_at &&
                        comment.updated_at !== comment.created_at &&
                        " · 수정됨"}
                    </p>
                  </div>

                  {/* ✅ 내 댓글이거나 관리자일 때만 버튼 표시 */}
                  {(isMine || isAdmin) && (
                    <div className="flex flex-wrap items-center gap-3">
                      {isMine && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (editCommentId === comment.id) {
                                setEditCommentId("");
                                setEditPassword("");
                                setEditContent("");
                              } else {
                                setEditCommentId(comment.id);
                                setEditPassword("");
                                setEditContent(comment.content);
                                setDeleteCommentId("");
                                setDeletePassword("");
                              }
                              setMessage("");
                            }}
                            className="text-sm font-semibold text-gray-700 underline underline-offset-4"
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteCommentId(
                                deleteCommentId === comment.id ? "" : comment.id
                              );
                              setDeletePassword("");
                              setEditCommentId("");
                              setEditPassword("");
                              setEditContent("");
                              setMessage("");
                            }}
                            className="text-sm font-semibold text-red-600 underline underline-offset-4"
                          >
                            삭제
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleAdminDelete(comment.id)}
                          className="text-sm font-semibold text-red-700 underline underline-offset-4 disabled:opacity-50"
                        >
                          관리자 삭제
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-700 leading-8 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {editCommentId === comment.id && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수정할 댓글 내용
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black mb-3"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수정 비밀번호
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        className="min-w-[220px] flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        disabled={isEditing}
                        onClick={() => handleEdit(comment.id)}
                        className="inline-flex items-center rounded-full border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
                      >
                        {isEditing ? "수정 중..." : "수정 확인"}
                      </button>
                    </div>
                  </div>
                )}

                {deleteCommentId === comment.id && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      삭제 비밀번호
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        className="min-w-[220px] flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(comment.id)}
                        className="inline-flex items-center rounded-full border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {isDeleting ? "삭제 중..." : "삭제 확인"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}