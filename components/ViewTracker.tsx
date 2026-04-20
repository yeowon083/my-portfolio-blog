"use client";

import { useEffect } from "react";

const VIEWED_POST_PREFIX = "viewed-post:";
const VIEW_COOLDOWN_MS = 1000 * 60 * 60 * 24;
const pendingViewSlugs = new Set<string>();

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const storageKey = `${VIEWED_POST_PREFIX}${slug}`;
    const lastViewedAt = Number(localStorage.getItem(storageKey) ?? 0);

    if (Date.now() - lastViewedAt < VIEW_COOLDOWN_MS) {
      return;
    }

    if (pendingViewSlugs.has(slug)) {
      return;
    }

    pendingViewSlugs.add(slug);

    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          localStorage.setItem(storageKey, String(Date.now()));
        }
      })
      .catch(() => {
        // 조회수 실패는 사용자 화면을 막지 않음
      })
      .finally(() => {
        pendingViewSlugs.delete(slug);
      });
  }, [slug]);

  return null;
}
