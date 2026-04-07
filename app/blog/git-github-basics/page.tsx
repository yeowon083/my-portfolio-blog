import Link from "next/link";

export default function GitGithubBasicsPage() {
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
            Learning
          </span>
          <p className="text-sm text-gray-500">2026.04</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          Git과 GitHub를 배우며
          <br />
          정리한 기본 개념
        </h1>

        <p className="text-lg text-gray-600 leading-8 mb-12">
          프로젝트를 진행하면서 add, commit, push 같은 기본 개념을 실제 흐름과
          연결해 이해하게 된 과정을 정리한 글입니다.
        </p>

        <div className="space-y-6 text-lg text-gray-700 leading-8">
          <p>
            프로젝트를 진행하면서 Git과 GitHub를 단순히 코드 저장소가 아니라,
            작업 과정을 기록하고 관리하는 도구로 이해하게 되었습니다.
          </p>

          <p>
            add는 변경한 파일을 다음 저장 대상으로 올려두는 단계이고, commit은
            그 변경 내용을 하나의 기록으로 남기는 단계이며, push는 그 기록을
            GitHub에 올리는 단계라고 이해했습니다.
          </p>

          <p>
            처음에는 명령어를 외우는 느낌이 강했지만, 실제 프로젝트를 수정하고
            다시 반영하는 과정을 반복하면서 각각의 역할이 조금 더 명확하게
            느껴졌습니다.
          </p>

          <p>
            지금은 수정하고, 저장하고, commit하고, push하는 흐름 자체가 하나의
            개발 습관이 되도록 익히고 있습니다.
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