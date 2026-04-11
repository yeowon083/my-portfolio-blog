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

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProject } = await supabase
    .from("projects")
    .select("id, title, slug, summary, tech_stack")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const project = (featuredProject as Project | null) ?? null;

  return (
    <main className="min-h-[calc(100vh-81px)]">
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/profile.jpg"
            alt="Yeowon profile"
            width={56}
            height={56}
            className="rounded-full object-cover"
          />

          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">
              Portfolio Blog
            </p>
            <p className="text-sm text-gray-600">
              AI Service Planning · Mobile App Development
            </p>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          YEOWON&apos;S PORTFOLIO
        </h1>

        <p className="text-lg text-gray-600 leading-8 max-w-2xl mb-10">
          서비스 기획, 모바일 앱 개발, 기술 학습 기록을 정리하는 공간입니다.
          현재는 소비 데이터를 바탕으로 충동 소비 가능성을 예측하고, 사용자가
          자신의 소비 패턴을 더 쉽게 돌아볼 수 있도록 돕는 앱을 만들고
          있습니다.
        </p>

        <div className="flex flex-nowrap items-center gap-3 mb-16 overflow-x-auto">
          <Link
            href="/projects"
            className="inline-flex shrink-0 items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            프로젝트 보기
          </Link>

          <Link
            href="/about"
            className="inline-flex shrink-0 items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            소개 보기
          </Link>

          <a
            href="https://github.com/yeowon083"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            GitHub
          </a>

          <a
            href="mailto:yeowon083@gmail.com"
            className="inline-flex shrink-0 items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Contact
          </a>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-gray-200 p-7 shadow-sm flex h-full flex-col">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold">대표 프로젝트</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                진행 중
              </span>
            </div>

            {project ? (
              <>
                <h3 className="text-xl font-semibold mb-3">{project.title}</h3>

                <p className="text-gray-600 leading-8 mb-5">
                  {project.summary ?? "프로젝트 요약이 아직 없습니다."}
                </p>

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech_stack.map((tech: string) => (
                      <span
                        key={tech}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-8">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-sm font-semibold text-gray-900 underline underline-offset-4"
                  >
                    자세히 보기
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-3">
                  아직 공개된 프로젝트가 없습니다
                </h3>

                <p className="text-gray-600 leading-8 mb-5">
                  프로젝트를 공개하면 이 영역에 대표 프로젝트가 표시됩니다.
                </p>

                <div className="mt-auto pt-8">
                  <Link
                    href="/projects"
                    className="text-sm font-semibold text-gray-900 underline underline-offset-4"
                  >
                    프로젝트 보러 가기
                  </Link>
                </div>
              </>
            )}
          </article>

          <article className="rounded-3xl border border-gray-200 p-7 flex h-full flex-col">
            <h2 className="text-2xl font-semibold mb-4">이 블로그에는</h2>

            <ul className="space-y-3 text-gray-600 leading-7">
              <li>
                프로젝트를 기획하고
                <br />
                구현해 나가는 과정을 기록합니다.
              </li>
              <li>
                배운 기술을 정리하고
                <br />
                개선 과정도 함께 남깁니다.
              </li>
              <li>
                앱을 만들며 고민한 점과
                <br />
                배운 점도 꾸준히 쌓아갑니다.
              </li>
            </ul>

            <div className="mt-auto pt-8">
              <Link
                href="/blog"
                className="text-sm font-semibold text-gray-900 underline underline-offset-4"
              >
                글 보러 가기
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}