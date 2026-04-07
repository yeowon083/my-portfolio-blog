export default function ProjectsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Projects</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-3">충동소비 예측 앱</h2>
          <p className="text-gray-600 leading-7">
            소비 데이터를 바탕으로 충동 소비 가능성을 예측하고, 사용자가 자신의
            소비 패턴을 더 쉽게 기록하고 돌아볼 수 있도록 돕는 앱을 기획하고
            있습니다.
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-3">준비 중인 다음 프로젝트</h2>
          <p className="text-gray-600 leading-7">
            현재 새로운 프로젝트를 기획 중이며, 문제 정의와 방향을 정리한 뒤
            이곳에 업데이트할 예정입니다.
          </p>
        </article>
      </div>
    </main>
  );
}