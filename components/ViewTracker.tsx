"use client";

import { useEffect } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/posts/${slug}/view`, {
      method: "POST",
    }).catch(() => {
      // 조회수 실패는 사용자 화면을 막지 않음
    });
  }, [slug]);

  return null;
}