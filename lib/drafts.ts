export function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  const rawDraft = window.localStorage.getItem(key);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as T;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, draft: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(draft));
}

export function removeDraft(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
