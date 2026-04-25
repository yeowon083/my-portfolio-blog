"use client";

import { useEffect, useRef, useState } from "react";
import { readDraft, removeDraft, saveDraft } from "@/lib/drafts";

type UseAutoDraftOptions<T> = {
  key: string;
  value: T;
  applyDraft: (draft: T) => void;
  delayMs?: number;
};

export function useAutoDraft<T>({
  key,
  value,
  applyDraft,
  delayMs = 800,
}: UseAutoDraftOptions<T>) {
  const [draftStatus, setDraftStatus] = useState("");
  const hasLoadedDraftRef = useRef(false);

  useEffect(() => {
    if (hasLoadedDraftRef.current) {
      return;
    }

    hasLoadedDraftRef.current = true;

    const savedDraft = readDraft<T>(key);

    if (!savedDraft) {
      return;
    }

    applyDraft(savedDraft);
    const timer = window.setTimeout(() => {
      setDraftStatus("자동 저장된 내용을 불러왔어요.");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [applyDraft, key]);

  useEffect(() => {
    if (!hasLoadedDraftRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      saveDraft(key, value);
      setDraftStatus("자동 저장됨");
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, key, value]);

  useEffect(() => {
    if (!draftStatus) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDraftStatus("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [draftStatus]);

  function clearDraft() {
    removeDraft(key);
    setDraftStatus("저장된 임시 내용을 삭제했어요.");
  }

  function loadDraft() {
    const savedDraft = readDraft<T>(key);

    if (!savedDraft) {
      setDraftStatus("불러올 임시 내용이 없어요.");
      return;
    }

    applyDraft(savedDraft);
    setDraftStatus("저장된 임시 내용을 불러왔어요.");
  }

  function saveNow() {
    saveDraft(key, value);
    setDraftStatus("지금 내용으로 저장했어요.");
  }

  return {
    draftStatus,
    clearDraft,
    loadDraft,
    saveNow,
  };
}
