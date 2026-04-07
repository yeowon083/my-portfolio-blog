export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Blog</h1>

      <div className="space-y-6">
        <article className="rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">2026.04</p>
          <h2 className="text-xl font-semibold mb-3">
            충동소비 예측 앱을 기획하며 정한 핵심 지표
          </h2>
          <p className="text-gray-600 leading-7">
            예산 사용률, 감정 요인, 계획 소비 여부 등 어떤 데이터를 중심으로
            문제를 정의했는지 정리한 글입니다.
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">2026.04</p>
          <h2 className="text-xl font-semibold mb-3">
            Git과 GitHub를 배우며 이해한 기본 개념
          </h2>
          <p className="text-gray-600 leading-7">
            add, commit, push, branch 같은 기본 개념을 실습 경험과 함께 정리한
            글입니다.
          </p>
        </article>
      </div>
    </main>
  );
}