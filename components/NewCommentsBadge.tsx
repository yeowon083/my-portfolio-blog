"use client";

import { useEffect, useState } from "react";

const LAST_SEEN_KEY = "admin_comments_last_seen";

export default function NewCommentsBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const since = localStorage.getItem(LAST_SEEN_KEY) ?? "";

    const url = since
      ? `/api/admin/comments?since=${encodeURIComponent(since)}&countOnly=true`
      : `/api/admin/comments?countOnly=true`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
