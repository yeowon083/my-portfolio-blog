import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-81px)] flex items-center">
      <section className="max-w-4xl mx-auto w-full px-6 py-20">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Portfolio Blog
        </p>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI와 데이터를 활용한
          <br />
          프로젝트와 기록의 공간
        </h1>

        <p className="text-lg text-gray-600 leading-8 max-w-2xl mb-10">
          서비스 기획, AI 프로젝트, 기술 학습 과정과 시행착오를 차근차근
          정리합니다. 만들면서 배우고, 배우면서 더 나은 경험을 고민하는
          과정을 담고 있습니다.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            프로젝트 보기
          </Link>

          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            블로그 글 보기
          </Link>
        </div>
      </section>
    </main>
  );
}