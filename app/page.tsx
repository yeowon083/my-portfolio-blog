import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-81px)]">
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Portfolio Blog
        </p>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI와 데이터를 활용해
          <br />
          실제로 쓰이는 앱을
          <br />
          기획하고 만듭니다
        </h1>

        <p className="text-lg text-gray-600 leading-8 max-w-2xl mb-10">
          서비스 기획, 모바일 앱 개발, 기술 학습 기록을 정리하는 공간입니다.
          현재는 소비 데이터를 바탕으로 충동 소비 가능성을 예측하고, 사용자가
          자신의 소비 패턴을 더 쉽게 돌아볼 수 있도록 돕는 앱을 만들고
          있습니다.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            프로젝트 보기
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            소개 보기
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-16">
          <a
            href="https://github.com/yeowon083"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            GitHub
          </a>

          <a
            href="mailto:yeowon083@gmail.com"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Contact
          </a>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold">대표 프로젝트</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                진행 중
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-3">충동소비 예측 앱</h3>
            <p className="text-gray-600 leading-8 mb-5">
              지출 기록과 소비 패턴 데이터를 바탕으로 충동 소비 위험을 예측하고,
              예산 관리와 소비 점검을 도와주는 모바일 앱 프로젝트입니다.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                Expo
              </span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                React Native
              </span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                TypeScript
              </span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                Supabase
              </span>
            </div>

            <Link
              href="/projects"
              className="text-sm font-semibold text-gray-900 underline underline-offset-4"
            >
              자세히 보기
            </Link>
          </article>

          <article className="rounded-3xl border border-gray-200 p-7">
            <h2 className="text-2xl font-semibold mb-4">이 블로그에는</h2>

            <ul className="space-y-3 text-gray-600 leading-7">
              <li>프로젝트 기획 과정</li>
              <li>기술 학습 기록과 구현 과정</li>
              <li>시행착오와 개선 포인트</li>
              <li>앱을 만들며 배운 점 정리</li>
            </ul>

            <div className="mt-8">
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