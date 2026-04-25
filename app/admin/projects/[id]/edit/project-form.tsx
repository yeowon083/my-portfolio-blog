"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMarkdownEditor from "@/components/LiveMarkdownEditor";
import { createClient } from "@/lib/supabase/client";
import { removeDraft } from "@/lib/drafts";
import { useAutoDraft } from "@/lib/useAutoDraft";

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
  const draftValue = useMemo(
    () => ({
      title,
      slug,
      summary,
      description,
      thumbnailUrl,
      projectUrl,
      githubUrl,
      techStackInput,
      isPublished,
    }),
    [
      title,
      slug,
      summary,
      description,
      thumbnailUrl,
      projectUrl,
      githubUrl,
      techStackInput,
      isPublished,
    ]
  );

  const applyDraft = useCallback((draft: ProjectDraft) => {
    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setSummary(draft.summary ?? "");
    setDescription(draft.description ?? "");
    setThumbnailUrl(draft.thumbnailUrl ?? "");
    setProjectUrl(draft.projectUrl ?? "");
    setGithubUrl(draft.githubUrl ?? "");
    setTechStackInput(draft.techStackInput ?? "");
    setIsPublished(draft.isPublished ?? false);
  }, []);

  const { draftStatus, clearDraft, loadDraft, saveNow } =
    useAutoDraft<ProjectDraft>({
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

    setTitle("");
    setSlug("");
    setSummary("");
    setDescription("");
    setThumbnailUrl("");
    setProjectUrl("");
    setGithubUrl("");
    setTechStackInput("");
    setIsPublished(false);
    clearDraft();
    setMessage("");
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
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Admin
      </p>

      <h1 className="mb-10 text-4xl font-bold tracking-tight">프로젝트 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            프로젝트 제목
          </label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
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
          />
          <p className="mt-2 text-xs text-gray-500">
            영문 소문자, 숫자, 하이픈(-) 형태를 추천해요.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            요약
          </label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <LiveMarkdownEditor
          label="설명"
          value={description}
          onChange={setDescription}
          rows={10}
          emptyText="설명을 작성하면 여기에 표시됩니다."
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            썸네일 URL
          </label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            프로젝트 링크
          </label>
          <input
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            GitHub 링크
          </label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            기술 스택
          </label>
          <input
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            placeholder="예: Next.js, TypeScript, Supabase"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
          <p className="mt-2 text-xs text-gray-500">
            쉼표(,)로 구분해서 입력해요.
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

        {draftStatus && <p className="text-sm text-gray-500">{draftStatus}</p>}
        {message && <p className="text-sm text-red-600">{message}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
          >
            {isSaving ? "저장 중.." : "저장"}
          </button>
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
