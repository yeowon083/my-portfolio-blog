"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { readDraft, removeDraft, saveDraft } from "@/lib/drafts";

type ProjectDraft = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  projectUrl: string;
  githubUrl: string;
  techStackInput: string;
  isPublished: boolean;
};

type ProjectFormProps = {
  initialData: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    description: string | null;
    thumbnail_url: string | null;
    project_url: string | null;
    github_url: string | null;
    tech_stack: string[] | null;
    is_published: boolean;
  };
};

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

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const draftKey = `draft:project:${initialData.id}`;

  const [title, setTitle] = useState(initialData.title ?? "");
  const [slug, setSlug] = useState(initialData.slug ?? "");
  const [summary, setSummary] = useState(initialData.summary ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData.thumbnail_url ?? ""
  );
  const [projectUrl, setProjectUrl] = useState(initialData.project_url ?? "");
  const [githubUrl, setGithubUrl] = useState(initialData.github_url ?? "");
  const [techStackInput, setTechStackInput] = useState(
    (initialData.tech_stack ?? []).join(", ")
  );
  const [isPublished, setIsPublished] = useState(
    initialData.is_published ?? false
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const techStack = parseTechStack(techStackInput);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function getDraft() {
    return {
      title,
      slug,
      summary,
      description,
      thumbnailUrl,
      projectUrl,
      githubUrl,
      techStackInput,
      isPublished,
    };
  }

  function handleSaveDraft() {
    saveDraft<ProjectDraft>(draftKey, getDraft());
    setMessage("임시저장했습니다.");
  }

  function handleLoadDraft() {
    const draft = readDraft<ProjectDraft>(draftKey);

    if (!draft) {
      setMessage("불러올 임시저장이 없습니다.");
      return;
    }

    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setSummary(draft.summary ?? "");
    setDescription(draft.description ?? "");
    setThumbnailUrl(draft.thumbnailUrl ?? "");
    setProjectUrl(draft.projectUrl ?? "");
    setGithubUrl(draft.githubUrl ?? "");
    setTechStackInput(draft.techStackInput ?? "");
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

    const { error } = await supabase
      .from("projects")
      .update({
        title: trimmedTitle,
        slug: trimmedSlug,
        summary: trimmedSummary || null,
        description: trimmedDescription || null,
        thumbnail_url: trimmedThumbnailUrl || null,
        project_url: trimmedProjectUrl || null,
        github_url: trimmedGithubUrl || null,
        tech_stack: techStack,
        is_published: isPublished,
      })
      .eq("id", initialData.id);

    setIsSaving(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    removeDraft(draftKey);
    router.replace("/admin/projects");
    router.refresh();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        Admin
      </p>

      <h1 className="text-4xl font-bold tracking-tight mb-10">프로젝트 수정</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 제목
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
                <div className="prose max-w-none prose-headings:mt-4 prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2 prose-p:my-2 prose-hr:my-3 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-normal prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none">
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
