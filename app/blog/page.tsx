export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <section className="mb-12 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Blog
        </p>

        <h1 className="text-4xl font-bold tracking-tight mb-6">
          프로젝트를 만들며 배우고 기록한
          <br />
          생각과 과정을 정리합니다
        </h1>

        <p className="text-lg text-gray-600 leading-8">
          기술 개념을 단순히 정리하는 것보다, 실제로 프로젝트를 진행하면서
          무엇을 고민했고 어떻게 구현했는지, 어떤 시행착오를 겪었는지를 중심으로
          기록하고 있습니다.
        </p>
      </section>

      <section className="space-y-6">
        <article className="rounded-3xl border border-gray-200 p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              Project
            </span>
            <p className="text-sm text-gray-500">2026.04</p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            충동소비 예측 앱을 만들게 된 이유
          </h2>

          <p className="text-gray-600 leading-8 mb-6">
            소비 기록과 패턴 데이터를 바탕으로 사용자가 자신의 지출 흐름을 더 잘
            이해할 수 있도록 돕는 앱을 기획하게 된 배경과 문제 정의 과정을
            정리한 글입니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              App
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Planning
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              AI Service
            </span>
          </div>

          <button className="text-sm font-semibold text-gray-900 underline underline-offset-4">
            글 준비 중
          </button>
        </article>

        <article className="rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              Development
            </span>
            <p className="text-sm text-gray-500">2026.04</p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Expo와 React Native로 앱 개발을 시작한 이유
          </h2>

          <p className="text-gray-600 leading-8 mb-6">
            충동소비 예측 앱을 구현하기 위해 왜 모바일 앱 형태를 선택했는지,
            그리고 Expo와 React Native를 사용하기로 한 이유를 정리한 글입니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Expo
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              React Native
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Mobile App
            </span>
          </div>

          <button className="text-sm font-semibold text-gray-900 underline underline-offset-4">
            글 준비 중
          </button>
        </article>

        <article className="rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              Learning
            </span>
            <p className="text-sm text-gray-500">2026.04</p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Git과 GitHub를 배우며 정리한 기본 개념
          </h2>

          <p className="text-gray-600 leading-8 mb-6">
            add, commit, push 같은 기본 개념을 프로젝트 진행 과정과 연결해서
            이해한 내용을 정리한 글입니다.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Git
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              GitHub
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
              Basics
            </span>
          </div>

          <button className="text-sm font-semibold text-gray-900 underline underline-offset-4">
            글 준비 중
          </button>
        </article>
      </section>
    </main>
  );
}