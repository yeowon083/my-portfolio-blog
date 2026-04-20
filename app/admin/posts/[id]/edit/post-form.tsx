"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  getCategoryLabel,
  getCategoryOptions,
  type Category,
} from "@/lib/categories";
import { readDraft, removeDraft, saveDraft } from "@/lib/drafts";

type PostDraft = {
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  tagsInput: string;
  isPublished: boolean;
};

type PostFormProps = {
  initialData: {
    id: string;
    title: string;
    slug: string;
    content: string;
    is_published: boolean;
    tags?: string[] | null;
    category_id?: string | null;
  };
  categories: Category[];
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPreviewDate() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function PostForm({
  initialData,
  categories,
}: PostFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const draftKey = `draft:post:${initialData.id}`;

  const [title, setTitle] = useState(initialData.title ?? "");
  const [slug, setSlug] = useState(initialData.slug ?? "");
  const [content, setContent] = useState(initialData.content ?? "");
  const [categoryId, setCategoryId] = useState(initialData.category_id ?? "");
  const [tagsInput, setTagsInput] = useState(
    (initialData.tags ?? []).join(", ")
  );
  const [isPublished, setIsPublished] = useState(
    initialData.is_published ?? false
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tags = parseTags(tagsInput);
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? null;
  const categoryOptions = getCategoryOptions(categories);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function getDraft() {
    return {
      categoryId,
      title,
      slug,
      content,
      tagsInput,
      isPublished,
    };
  }

  function handleSaveDraft() {
    saveDraft<PostDraft>(draftKey, getDraft());
    setMessage("임시저장했습니다.");
  }

  function handleLoadDraft() {
    const draft = readDraft<PostDraft>(draftKey);

    if (!draft) {
      setMessage("불러올 임시저장이 없습니다.");
      return;
    }

    setCategoryId(draft.categoryId ?? "");
    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setContent(draft.content ?? "");
    setTagsInput(draft.tagsInput ?? "");
    setIsPublished(draft.isPublished ?? false);
    setMessage("임시저장을 불러왔습니다.");
  }

  function handleRemoveDraft() {
    removeDraft(draftKey);
    setMessage("임시저장을 삭제했습니다.");
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

    const { error } = await supabase
      .from("posts")
      .update({
        title: trimmedTitle,
        slug: trimmedSlug,
        content: trimmedContent,
        category_id: categoryId || null,
        tags,
        is_published: isPublished,
      })
      .eq("id", initialData.id);

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
    <main className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        Admin
      </p>

      <h1 className="text-4xl font-bold tracking-tight mb-10">글 수정</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-2 text-xs text-gray-500">
              영어 소문자, 숫자, 하이픈(-) 형태로 관리하는 것을 추천해.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="예: AI, App, Supabase"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-2 text-xs text-gray-500">
              쉼표(,)로 구분해서 입력해.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              본문
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            발행하기
          </label>

          {message && <p className="text-sm text-red-600">{message}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              임시저장
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
              임시저장 삭제
            </button>
          </div>
        </form>

        <section>
          <div className="sticky top-24">
            <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
              Preview
            </p>

            <article className="rounded-3xl border border-gray-200 p-7 shadow-sm bg-white">
              {selectedCategory && (
                <p className="text-sm font-semibold tracking-[0.12em] text-gray-500 uppercase mb-4">
                  {getCategoryLabel(selectedCategory, categories)}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isPublished
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>

                <p className="text-sm text-gray-500">{formatPreviewDate()}</p>
              </div>

              <h2 className="text-3xl font-bold tracking-tight leading-tight mb-4">
                {title || "제목이 여기에 표시됩니다"}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {slug ? `/blog/${slug}` : "/blog/your-slug"}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose prose-gray max-w-none prose-headings:tracking-tight prose-a:break-all">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || "본문이 여기에 표시됩니다."}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
