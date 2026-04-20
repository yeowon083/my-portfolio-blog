"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LiveMarkdownEditor from "@/components/LiveMarkdownEditor";
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

export default function NewProjectPage() {
  const supabase = createClient();
  const router = useRouter();
  const draftKey = "draft:project:new";

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

    removeDraft(draftKey);
    router.replace("/admin/projects");
    router.refresh();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        Admin
      </p>

      <h1 className="text-4xl font-bold tracking-tight mb-10">새 프로젝트 작성</h1>

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

          <LiveMarkdownEditor
            label="설명"
            value={description}
            onChange={setDescription}
            rows={10}
            placeholder="프로젝트 설명을 입력하세요"
            emptyText="설명이 여기에 표시됩니다."
          />

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
    </main>
  );
}
