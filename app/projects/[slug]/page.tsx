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
        className="rounded-md bg-gray-100 px-4 py-3 overflow-x-auto my-4 text-sm text-gray-800 leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit [&>code]:rounded-none"
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
        className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.9em] font-normal text-gray-800 before:content-none after:content-none"
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
    <main className="max-w-3xl mx-auto px-6 py-20">
      <Link
        href="/projects"
        className="inline-flex items-center text-sm font-semibold text-gray-500 underline underline-offset-4 mb-10"
      >
        ← Projects로 돌아가기
      </Link>

      <article>
        <p className="text-sm text-gray-500 mb-5">
          {formatDate(typedProject.created_at)}
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          {typedProject.title}
        </h1>

        {typedProject.tech_stack && typedProject.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {typedProject.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {typedProject.summary && (
          <p className="text-lg text-gray-600 leading-8 mb-10">
            {typedProject.summary}
          </p>
        )}

        {typedProject.thumbnail_url && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
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
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              프로젝트 링크
            </a>
          )}

          {typedProject.github_url && (
            <a
              href={typedProject.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              GitHub
            </a>
          )}
        </div>

        {typedProject.description ? (
          <div className="prose max-w-none prose-headings:mt-4 prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2 prose-p:my-2 prose-hr:my-3 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-normal prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            >
              {typedProject.description}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 leading-8">
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