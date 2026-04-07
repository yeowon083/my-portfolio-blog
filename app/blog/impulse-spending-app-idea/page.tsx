import Link from "next/link";

export default function ImpulseSpendingAppIdeaPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm font-semibold text-gray-500 underline underline-offset-4 mb-8"
      >
        ← Blog로 돌아가기
      </Link>

      <article>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            Project
          </span>
          <p className="text-sm text-gray-500">2026.04</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          충동소비 예측 앱을
          <br />
          만들게 된 이유
        </h1>

        <p className="text-lg text-gray-600 leading-8 mb-12">
          단순한 지출 기록을 넘어, 사용자가 자신의 소비 패턴을 더 잘 이해하고
          돌아볼 수 있도록 돕는 앱을 만들고 싶었던 배경과 문제 정의 과정을
          정리한 글입니다.
        </p>

        <div className="space-y-6 text-lg text-gray-700 leading-8">
          <p>
            평소 소비를 기록하더라도, 단순히 얼마를 썼는지만 보는 것으로는 내
            소비 패턴을 충분히 이해하기 어렵다고 느꼈습니다.
          </p>

          <p>
            그래서 지출 기록을 남기는 것을 넘어, 어떤 상황에서 충동 소비가
            발생하는지 흐름을 파악하고, 사용자가 자신의 소비 습관을 더 쉽게
            돌아볼 수 있도록 돕는 앱을 만들고 싶었습니다.
          </p>

          <p>
            이 프로젝트에서는 월 예산 사용률, 지출 시간, 소비 카테고리, 계획된
            소비 여부 같은 데이터를 바탕으로 소비 패턴을 정리하고, 충동 소비
            가능성을 예측하는 방향으로 문제를 정의하고 있습니다.
          </p>

          <p>
            단순한 기록 앱이 아니라, 데이터를 통해 사용자의 소비 행동을 더 잘
            이해하도록 돕는 서비스로 발전시키는 것이 이 프로젝트의 목표입니다.
          </p>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Blog 목록으로 돌아가기
          </Link>
        </div>
      </article>
    </main>
  );
}