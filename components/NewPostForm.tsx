"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMarkdownEditor from "@/components/LiveMarkdownEditor";
import { createClient } from "@/lib/supabase/client";
import {
  getCategoryLabel,
  getCategoryOptions,
  type Category,
} from "@/lib/categories";
import { removeDraft } from "@/lib/drafts";
import { useAutoDraft } from "@/lib/useAutoDraft";

type PostDraft = {
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  tagsInput: string;
  isPublished: boolean;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function NewPostForm({
  categories,
}: {
  categories: Category[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const draftKey = "draft:post:new";

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tags = parseTags(tagsInput);
  const categoryOptions = getCategoryOptions(categories);
  const draftValue = useMemo(
    () => ({
      categoryId,
      title,
      slug,
      content,
      tagsInput,
      isPublished,
    }),
    [categoryId, title, slug, content, tagsInput, isPublished]
  );

  const applyDraft = useCallback((draft: PostDraft) => {
    setCategoryId(draft.categoryId ?? "");
    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setContent(draft.content ?? "");
    setTagsInput(draft.tagsInput ?? "");
    setIsPublished(draft.isPublished ?? false);
  }, []);

  const { draftStatus, clearDraft, loadDraft, saveNow } =
    useAutoDraft<PostDraft>({
      key: draftKey,
      value: draftValue,
      applyDraft,
    });

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function handleSaveDraft() {
    saveNow();
  }

  function handleLoadDraft() {
    loadDraft();
  }

  function handleRemoveDraft() {
    clearDraft();
  }

  function handleResetForm() {
    const shouldReset = window.confirm("정말 초기화하시겠습니까?");

    if (!shouldReset) {
      return;
    }

    setCategoryId("");
    setTitle("");
    setSlug("");
    setContent("");
    setTagsInput("");
    setIsPublished(false);
    clearDraft();
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedSlug || !trimmedContent) {
      setMessage("제목, slug, 본문은 필수입니다.");
      return;
    }

    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSaving(false);
      setMessage("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title: trimmedTitle,
      slug: trimmedSlug,
      content: trimmedContent,
      category_id: categoryId || null,
      tags,
      is_published: isPublished,
      author_id: user.id,
    });

    setIsSaving(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    removeDraft(draftKey);
    router.replace("/admin/posts");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Admin
      </p>

      <h1 className="mb-10 text-4xl font-bold tracking-tight">새 글 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">카테고리 선택</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryLabel(category, categories)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            태그
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            suppressHydrationWarning
          />
        </div>

        <LiveMarkdownEditor
          label="본문"
          value={content}
          onChange={setContent}
          rows={16}
          emptyText="본문을 작성하면 여기에 표시됩니다."
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          발행하기
        </label>

        {draftStatus && <p className="text-sm text-gray-500">{draftStatus}</p>}
        {message && <p className="text-sm text-red-600">{message}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
        >
          {isSaving ? "저장 중.." : "저장"}
        </button>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            지금 저장
          </button>
          <button
            type="button"
            onClick={handleLoadDraft}
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            불러오기
          </button>
          <button
            type="button"
            onClick={handleRemoveDraft}
            className="inline-flex items-center rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            임시 내용 삭제
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            초기화
          </button>
        </div>
      </form>
    </main>
  );
}
