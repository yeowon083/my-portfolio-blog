import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "이여원의 소개, 관심 분야, 기술 스택을 정리한 페이지",
};

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="grid gap-10 md:grid-cols-[220px_1fr]">
        <div className="fade-up flex flex-col">
          <Image
            src="/profile 2.jpg"
            alt="Yeowon profile"
            width={220}
            height={220}
            className="rounded-2xl border border-neutral-100 object-cover shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full"
          />

          <div className="surface-card mt-5 p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">이여원</h2>
                <p className="text-sm text-neutral-400">Big Data & AI Student</p>
              </div>

              <span className="chip text-xs font-semibold">Building</span>
            </div>

            <div className="space-y-4 text-sm text-neutral-600">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                  Interest
                </p>
                <p className="leading-6">
                  AI Service Planning, Mobile App Development, Data-driven
                  Problem Solving
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                  Current Project
                </p>
                <p className="leading-6">충동소비 예측 앱</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
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
                className="button-primary px-4 py-2"
              >
                GitHub
              </a>

              <a
                href="mailto:yeowon083@gmail.com"
                className="button-secondary px-4 py-2"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="hero-panel fade-up anim-delay-75 h-full">
          <p className="kicker mb-4">About</p>

          <h1 className="page-title mb-6">
            데이터 기반으로 생각하고, 서비스로 구현합니다
          </h1>

          <div className="space-y-5 body-copy">
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

      <article className="surface-card hover-lift p-7 mt-14 fade-up anim-delay-150">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          <span className="chip">Python</span>
          <span className="chip">React Native</span>
          <span className="chip">Expo</span>
          <span className="chip">TypeScript</span>
          <span className="chip">Supabase</span>
          <span className="chip">GitHub</span>
          <span className="chip">Node.js</span>
        </div>
      </article>
    </main>
  );
}
