"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTechStack(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
};

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const techStack = parseTechStack(techStackInput);

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
    const trimmedDescription = description.trim();
    const trimmedThumbnailUrl = thumbnailUrl.trim();
    const trimmedProjectUrl = projectUrl.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedTitle || !trimmedSlug) {
      setMessage("제목과 slug는 필수입니다.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("projects").insert({
      title: trimmedTitle,
      slug: trimmedSlug,
      summary: trimmedSummary || null,
      description: trimmedDescription || null,
      thumbnail_url: trimmedThumbnailUrl || null,
      project_url: trimmedProjectUrl || null,
      github_url: trimmedGithubUrl || null,
      tech_stack: techStack,
      is_published: isPublished,
    });

    setIsSaving(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    router.replace("/admin/projects");
    router.refresh();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        Admin
      </p>

      <h1 className="text-4xl font-bold tracking-tight mb-10">새 프로젝트 작성</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 제목
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="예: Impulse Spending App"
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
              placeholder="예: impulse-spending-app"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-2 text-xs text-gray-500">
              영어 소문자, 숫자, 하이픈(-) 형태를 추천해.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요약
            </label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="짧은 프로젝트 소개"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              placeholder="프로젝트 설명을 입력하세요"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 URL
            </label>
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 링크
            </label>
            <input
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub 링크
            </label>
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기술 스택
            </label>
            <input
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="예: Next.js, TypeScript, Supabase"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-2 text-xs text-gray-500">
              쉼표(,)로 구분해서 입력해.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            공개하기
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
              </div>

              <h2 className="text-3xl font-bold tracking-tight leading-tight mb-4">
                {title || "프로젝트 제목이 여기에 표시됩니다"}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {slug ? `/projects/${slug}` : "/projects/your-slug"}
              </p>

              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {summary ? (
                <p className="text-lg text-gray-600 leading-8 mb-6">{summary}</p>
              ) : (
                <p className="text-lg text-gray-400 leading-8 mb-6">
                  요약이 여기에 표시됩니다.
                </p>
              )}

              {description ? (
                <div className="prose max-w-none prose-headings:mt-4 prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2 prose-p:my-2 prose-hr:my-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                  >
                    {description}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400 leading-8">
                  설명이 여기에 표시됩니다.
                </p>
              )}
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}