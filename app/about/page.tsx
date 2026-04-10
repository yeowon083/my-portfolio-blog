import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "이여원의 소개, 관심 분야, 기술 스택을 정리한 페이지",
};

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <section className="grid gap-10 md:grid-cols-[240px_1fr] items-start">
        <div>
          <Image
            src="/profile.jpg"
            alt="Yeowon profile"
            width={240}
            height={240}
            className="rounded-3xl object-cover"
          />

          <div className="mt-5 rounded-3xl border border-gray-200 p-5 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">이여원</h2>
                <p className="text-sm text-gray-500">Big Data & AI Student</p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Building
              </span>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-1">
                  Interest
                </p>
                <p className="leading-6">
                  AI Service Planning, Mobile App Development, Data-driven
                  Problem Solving
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-1">
                  Current Project
                </p>
                <p className="leading-6">충동소비 예측 앱</p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-1">
                  Contact
                </p>
                <p className="leading-6 break-all">yeowon083@gmail.com</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <a
                href="https://github.com/yeowon083"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
              >
                GitHub
              </a>

              <a
                href="mailto:yeowon083@gmail.com"
                className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
            About
          </p>

          <h1 className="text-4xl font-bold tracking-tight mb-6">
            데이터를 바탕으로 문제를 이해하고,
            <br />
            실제로 쓰이는 앱과 서비스를 고민합니다
          </h1>

          <div className="space-y-5 text-lg text-gray-600 leading-8">
            <p>
              안녕하세요. 빅데이터와 인공지능을 공부하며, AI와 데이터를 활용한
              서비스 기획과 제품 개발에 관심을 가지고 있습니다.
            </p>

            <p>
              단순히 기술을 배우는 데서 끝나지 않고, 사용자가 실제로 필요로 하는
              기능과 경험이 무엇인지 고민하고, 그것을 하나의 서비스 흐름으로
              연결하는 과정에 흥미를 느낍니다.
            </p>

            <p>
              현재는 지출 기록과 소비 패턴 데이터를 바탕으로 충동 소비 가능성을
              예측하고, 사용자가 자신의 소비를 더 쉽게 돌아볼 수 있도록 돕는 앱을
              만들고 있습니다.
            </p>

            <p>
              이 블로그에는 프로젝트를 진행하며 배운 점, 기술 학습 기록,
              시행착오와 개선 과정을 차근차근 정리하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 mt-14">
        <article className="rounded-3xl border border-gray-200 p-7 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Interest</h2>
          <ul className="space-y-3 text-gray-600 leading-7">
            <li>AI 기반 서비스 기획</li>
            <li>모바일 앱 개발</li>
            <li>데이터 기반 문제 해결</li>
            <li>사용자 경험과 기능 설계</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-gray-200 p-7">
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Python
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              React Native
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Expo
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              TypeScript
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Supabase
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              GitHub
            </span>
          </div>
        </article>
      </section>
    </main>
  );
}