import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Projects",
  description: "이여원의 프로젝트 포트폴리오 목록",
};

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
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

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, thumbnail_url, project_url, github_url, tech_stack, created_at"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="narrow-shell">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Projects</h1>
        <p className="text-red-500">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const typedProjects: Project[] = projects ?? [];

  return (
    <main className="page-shell">
      <section className="hero-panel fade-up mb-14 max-w-3xl">
        <p className="kicker mb-4">Projects</p>

        <h1 className="page-title mb-6">프로젝트 소개</h1>

        <p className="body-copy">만든 것들을 정리했습니다.</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {typedProjects.length > 0 ? (
          typedProjects.map((project, index) => (
            <article
              key={project.id}
              className={`surface-card hover-lift overflow-hidden fade-up ${
                index === 0
                  ? "anim-delay-75"
                  : index === 1
                  ? "anim-delay-150"
                  : index === 2
                  ? "anim-delay-225"
                  : "anim-delay-300"
              }`}
            >
              {project.thumbnail_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-50">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-neutral-50 flex items-center justify-center">
                  <span className="text-xs font-medium uppercase tracking-widest text-neutral-300">
                    No Image
                  </span>
                </div>
              )}

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                  {formatDate(project.created_at)}
                </p>

                <h2 className="text-2xl font-semibold tracking-tight mb-4">
                  {project.title}
                </h2>

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech_stack.map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {project.summary ? (
                  <p className="text-neutral-500 leading-8 mb-6">{project.summary}</p>
                ) : (
                  <p className="text-neutral-300 leading-8 mb-6">
                    아직 요약이 등록되지 않았습니다.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="button-primary px-4 py-2"
                  >
                    상세 보기
                  </Link>

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary px-4 py-2"
                    >
                      프로젝트 링크
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary px-4 py-2"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="surface-card md:col-span-2 border-dashed p-10 text-center">
            <p className="text-neutral-400">아직 공개된 프로젝트가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
