import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { createClient } from "@/lib/supabase/server";
import CommentSection from "@/components/CommentSection";
import type { Components } from "react-markdown";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  thumbnail_url: string | null;
  project_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
  },
};

const markdownComponents: Components = {
  pre({ children, ...props }) {
    return (
      <pre
        className="rounded-xl border border-neutral-200 bg-neutral-950 px-4 py-3 overflow-x-auto my-4 text-sm text-neutral-100 leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.12)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit [&>code]:rounded-none"
        {...props}
      >
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    if (className) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.9em] font-normal text-neutral-700 before:content-none after:content-none"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, summary")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!project) {
    return {
      title: "Project",
      description: "프로젝트 상세 페이지",
    };
  }

  return {
    title: `${project.title} | Projects`,
    description: project.summary ?? "프로젝트 상세 페이지",
    openGraph: {
      title: project.title,
      description: project.summary ?? "프로젝트 상세 페이지",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary ?? "프로젝트 상세 페이지",
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user && user.email === "yeowon083@gmail.com";

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, thumbnail_url, project_url, github_url, tech_stack, created_at"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !project) {
    notFound();
  }

  const typedProject = project as Project;

  return (
    <main className="narrow-shell">
      <Link
        href="/projects"
        className="back-link"
      >
        ← Projects로 돌아가기
      </Link>

      <article className="surface-card p-8 fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
          {formatDate(typedProject.created_at)}
        </p>

        <h1 className="page-title mb-6">
          {typedProject.title}
        </h1>

        {typedProject.tech_stack && typedProject.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {typedProject.tech_stack.map((tech) => (
              <span
                key={tech}
                className="chip"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {typedProject.summary && (
          <p className="body-copy mb-10">
            {typedProject.summary}
          </p>
        )}

        {typedProject.thumbnail_url && (
          <div className="surface-card mb-10 overflow-hidden bg-neutral-50">
            <img
              src={typedProject.thumbnail_url}
              alt={typedProject.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-10">
          {typedProject.project_url && (
            <a
              href={typedProject.project_url}
              target="_blank"
              rel="noreferrer"
              className="button-primary"
            >
              프로젝트 링크
            </a>
          )}

          {typedProject.github_url && (
            <a
              href={typedProject.github_url}
              target="_blank"
              rel="noreferrer"
              className="button-secondary"
            >
              GitHub
            </a>
          )}
        </div>

        {typedProject.description ? (
          <div className="content-prose">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            >
              {typedProject.description}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-neutral-300 leading-8">
            아직 상세 설명이 등록되지 않았습니다.
          </p>
        )}

        <CommentSection
          targetType="project"
          targetId={typedProject.id}
          isAdmin={isAdmin}
        />
      </article>
    </main>
  );
}
