"use client";

import { useEffect } from "react";

const LAST_SEEN_KEY = "admin_comments_last_seen";

export default function MarkReadOnMount() {
  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  }, []);

  return null;
}
