"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCommentDeleteButton({ commentId }: { commentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMode: true }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? "삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isDeleting}
      onClick={handleDelete}
      className="shrink-0 text-sm font-semibold text-red-600 underline underline-offset-4 hover:text-red-800 disabled:opacity-50"
    >
      {isDeleting ? "삭제 중..." : "삭제"}
    </button>
  );
}
