"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

export default function NewPostPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tags = parseTags(tagsInput);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const trimmedSummary = summary.trim();
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
      summary: trimmedSummary,
      content: trimmedContent,
      tags,
      is_published: isPublished,
      author_id: user.id,
    });

    setIsSaving(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    router.replace("/admin/posts");
    router.refresh();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        Admin
      </p>

      <h1 className="text-4xl font-bold tracking-tight mb-10">새 글 작성</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="예: 충동소비 예측 앱에서 기록할 핵심 데이터 정리"
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
              placeholder="예: impulse-spending-data"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-2 text-xs text-gray-500">
              영어 소문자, 숫자, 하이픈(-) 형태로 관리하는 것을 추천해.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요약
            </label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="글의 짧은 소개를 입력하세요"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
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
              placeholder="글 내용을 입력하세요"
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
          </div>
        </form>

        <section>
          <div className="sticky top-24">
            <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
              Preview
            </p>

            <article className="rounded-3xl border border-gray-200 p-7 shadow-sm bg-white">
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

              {summary ? (
                <p className="text-lg text-gray-600 leading-8 mb-8">
                  {summary}
                </p>
              ) : (
                <p className="text-lg text-gray-400 leading-8 mb-8">
                  요약이 여기에 표시됩니다.
                </p>
              )}

              <div className="whitespace-pre-wrap text-gray-700 leading-8">
                {content || "본문이 여기에 표시됩니다."}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}