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
      <main className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">Projects</h1>
        <p className="text-red-600">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const typedProjects: Project[] = projects ?? [];

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <section className="mb-14 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Projects
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          프로젝트를 소개합니다
        </h1>

        <p className="text-lg text-gray-600 leading-8">
          기획부터 구현까지 직접 진행한 프로젝트를 정리했습니다.
          문제 정의, 구현 방식, 사용 기술과 결과를 함께 볼 수 있습니다.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {typedProjects.length > 0 ? (
          typedProjects.map((project) => (
            <article
              key={project.id}
              className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {project.thumbnail_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                  썸네일 없음
                </div>
              )}

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-3">
                  {formatDate(project.created_at)}
                </p>

                <h2 className="text-2xl font-semibold tracking-tight mb-4">
                  {project.title}
                </h2>

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {project.summary ? (
                  <p className="text-gray-600 leading-8 mb-6">{project.summary}</p>
                ) : (
                  <p className="text-gray-400 leading-8 mb-6">
                    아직 요약이 등록되지 않았습니다.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
                  >
                    상세 보기
                  </Link>

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      프로젝트 링크
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="md:col-span-2 rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-600">아직 공개된 프로젝트가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}