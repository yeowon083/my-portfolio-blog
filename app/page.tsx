import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tech_stack: string[] | null;
};

type LatestPost = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  tags: string[] | null;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProject } = await supabase
    .from("projects")
    .select("id, title, slug, summary, tech_stack")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: latestBlogPost } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, tags")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const project = (featuredProject as Project | null) ?? null;
  const latestPost = (latestBlogPost as LatestPost | null) ?? null;

  return (
    <main className="min-h-[calc(100vh-73px)]">
      <section className="page-shell pt-12 sm:pt-20">
        <div className="hero-panel fade-up mb-8">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/profile 2.jpg"
              alt="Yeowon profile"
              width={52}
              height={52}
              className="rounded-xl border border-neutral-100 object-cover shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
            />

            <div>
              <p className="kicker">Portfolio Blog</p>
              <p className="text-sm text-neutral-400">
                AI Service Planning · Mobile App Development
              </p>
            </div>
          </div>

          <h1 className="home-title mb-6">YEOWON&apos;S PORTFOLIO</h1>

          <p className="body-copy max-w-2xl mb-10">
            서비스 기획, 모바일 앱 개발, 기술 학습 기록을 정리하는 공간입니다.
            현재는 소비 데이터를 바탕으로 충동 소비 가능성을 예측하고, 사용자가
            자신의 소비 패턴을 더 쉽게 돌아볼 수 있도록 돕는 앱을 만들고
            있습니다.
          </p>

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Link href="/projects" className="button-primary w-full sm:w-auto">
              프로젝트 보기
            </Link>

            <Link href="/about" className="button-secondary w-full sm:w-auto">
              소개 보기
            </Link>

            <a
              href="https://github.com/yeowon083"
              target="_blank"
              rel="noreferrer"
              className="button-secondary w-full sm:w-auto"
            >
              GitHub
            </a>

            <a
              href="mailto:yeowon083@gmail.com"
              className="button-secondary w-full sm:w-auto"
            >
              Contact
            </a>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="surface-card hover-lift flex h-full flex-col p-5 fade-up anim-delay-150 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">대표 프로젝트</h2>
              <span className="chip">진행 중</span>
            </div>

            {project ? (
              <>
                <h3 className="text-xl font-semibold tracking-tight mb-3">{project.title}</h3>

                <p className="text-neutral-500 leading-8 mb-5">
                  {project.summary ?? "프로젝트 요약이 아직 없습니다."}
                </p>

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech_stack.map((tech: string) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-8">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-sm font-semibold text-neutral-950 underline underline-offset-4 transition-all duration-200 hover:text-neutral-500"
                  >
                    자세히 보기
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold tracking-tight mb-3">
                  아직 공개된 프로젝트가 없습니다
                </h3>

                <p className="text-neutral-500 leading-8 mb-5">
                  프로젝트를 공개하면 이 영역에 대표 프로젝트가 표시됩니다.
                </p>

                <div className="mt-auto pt-8">
                  <Link
                    href="/projects"
                    className="text-sm font-semibold text-neutral-950 underline underline-offset-4 transition-all duration-200 hover:text-neutral-500"
                  >
                    프로젝트 보러 가기
                  </Link>
                </div>
              </>
            )}
          </article>

          <article className="surface-card hover-lift flex h-full flex-col p-5 fade-up anim-delay-225 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">최신 블로그 글</h2>
              <span className="chip">Latest</span>
            </div>

            {latestPost ? (
              <>
                <p className="mb-3 text-sm font-medium text-neutral-400">
                  작성일: {formatDate(latestPost.created_at)}
                </p>

                <h3 className="mb-3 text-xl font-semibold tracking-tight">
                  {latestPost.title}
                </h3>

                {latestPost.tags && latestPost.tags.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {latestPost.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                  <Link
                    href={`/blog/${latestPost.slug}`}
                    className="text-sm font-semibold text-neutral-950 underline underline-offset-4 transition-all duration-200 hover:text-neutral-500"
                  >
                    최신 글 보기
                  </Link>

                  <Link
                    href="/blog"
                    className="text-sm font-semibold text-neutral-400 underline underline-offset-4 transition-all duration-200 hover:text-neutral-950"
                  >
                    블로그 전체 보기
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-3 text-xl font-semibold tracking-tight">
                  아직 공개된 글이 없어요
                </h3>

                <p className="mb-5 leading-8 text-neutral-500">
                  새 글을 발행하면 이 자리에서 가장 최근 글을 바로 볼 수 있어요.
                </p>

                <div className="mt-auto pt-8">
                  <Link
                    href="/blog"
                    className="text-sm font-semibold text-neutral-950 underline underline-offset-4 transition-all duration-200 hover:text-neutral-500"
                  >
                    블로그 보러 가기
                  </Link>
                </div>
              </>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
