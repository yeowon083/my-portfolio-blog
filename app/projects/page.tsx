export default function ProjectsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <section className="mb-12">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-3">
          Portfolio
        </p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Projects</h1>
        <p className="text-lg text-gray-600 leading-8 max-w-2xl">
          진행한 프로젝트와 현재 만들고 있는 서비스를 정리하는 공간입니다.
          문제를 어떻게 정의했고, 어떤 기술을 사용했는지, 무엇을 배우고
          개선하고 있는지를 함께 기록합니다.
        </p>
      </section>

      <div className="grid gap-6">
        <article className="rounded-3xl border border-gray-200 p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold">충동소비 예측 앱</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              진행 중
            </span>
          </div>

          <p className="text-gray-600 leading-8 mb-6">
            지출 기록과 소비 패턴 데이터를 바탕으로 충동 소비 위험을 예측하고,
            사용자가 자신의 소비 흐름을 더 쉽게 점검할 수 있도록 돕는 모바일 앱
            프로젝트입니다.
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="rounded-2xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What I’m building
              </h3>
              <p className="text-sm text-gray-600 leading-7">
                빠른 지출 기록, 월 예산 사용률 확인, 소비 패턴 확인, 충동 소비
                가능성 예측 기능을 하나의 앱 흐름 안에서 구현하고 있습니다.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What I’m learning
              </h3>
              <p className="text-sm text-gray-600 leading-7">
                모바일 앱 구조 설계, 사용자 입력 흐름, 데이터 저장 방식, 그리고
                예측 기능을 서비스 형태로 연결하는 방법을 배우고 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/yeowon083/impulsive-spending-app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              GitHub 보기
            </a>
            <a
              href="/blog"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              관련 기록 보기
            </a>
          </div>
        </article>

        <article className="rounded-3xl border border-dashed border-gray-300 p-7">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold">다음 프로젝트</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              준비 중
            </span>
          </div>

          <p className="text-gray-600 leading-8 mb-6">
            새로운 문제를 정의하고 다음 프로젝트 주제를 정리하고 있습니다.
            방향이 구체화되면 이곳에 프로젝트 목표와 사용 기술, 진행 과정을
            추가할 예정입니다.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Problem Solving
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Service Planning
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Coming Soon
            </span>
          </div>
        </article>
      </div>
    </main>
  );
}