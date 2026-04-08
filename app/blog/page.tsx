import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "프로젝트를 만들며 배우고 기록한 생각과 과정을 정리한 블로그",
};
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const POSTS_PER_PAGE = 5;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  created_at: string;
  tags?: string[] | null;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ tag?: string; q?: string; page?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const tag = resolvedSearchParams.tag;
  const q = resolvedSearchParams.q;
  const page = resolvedSearchParams.page;

  const selectedTag = tag?.trim() ?? "";
  const keyword = q?.trim().toLowerCase() ?? "";
  const currentPage = Math.max(1, Number(page) || 1);

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, summary, created_at, tags")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <p className="text-red-600">글 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  let filteredPosts = posts ?? [];

  if (selectedTag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags?.includes(selectedTag)
    );
  }

  if (keyword) {
    filteredPosts = filteredPosts.filter((post) => {
      const inTitle = post.title.toLowerCase().includes(keyword);
      const inSummary = (post.summary ?? "").toLowerCase().includes(keyword);
      return inTitle || inSummary;
    });
  }

  const allTags = Array.from(
    new Set((posts ?? []).flatMap((post) => post.tags ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  function buildBlogHref({
    nextTag,
    nextQ,
    nextPage,
  }: {
    nextTag?: string;
    nextQ?: string;
    nextPage?: number;
  }) {
    const params = new URLSearchParams();

    if (nextTag) {
      params.set("tag", nextTag);
    }

    if (nextQ) {
      params.set("q", nextQ);
    }

    if (nextPage && nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const queryString = params.toString();
    return queryString ? `/blog?${queryString}` : "/blog";
  }

  function buildResetSearchHref() {
    return buildBlogHref({
      nextTag: selectedTag || undefined,
      nextQ: undefined,
      nextPage: 1,
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <section className="mb-14 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Blog
        </p>

        {selectedTag ? (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                Tag
              </span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                {selectedTag}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              {selectedTag} 태그와 관련된
              <br />
              글을 모아봤어요
            </h1>

            <p className="text-lg text-gray-600 leading-8 mb-6">
              현재 <span className="font-semibold text-gray-900">{selectedTag}</span>{" "}
              태그가 포함된 글을 보고 있습니다.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">총 {totalPosts}개의 글</span>

              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                전체 글 보기
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              프로젝트를 만들며 배우고 기록한
              <br />
              생각과 과정을 정리합니다
            </h1>

            <p className="text-lg text-gray-600 leading-8">
              실제 프로젝트를 진행하면서 무엇을 고민했고 어떻게 구현했는지,
              어떤 시행착오를 겪었는지를 중심으로 기록하고 있습니다.
            </p>
          </>
        )}
      </section>

      <form action="/blog" className="mb-8">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={keyword}
            placeholder="제목 또는 요약 검색"
            className="min-w-[260px] flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          {selectedTag && <input type="hidden" name="tag" value={selectedTag} />}

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            검색
          </button>

          {keyword && (
            <Link
              href={buildResetSearchHref()}
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              검색 초기화
            </Link>
          )}
        </div>
      </form>

      <section className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={buildBlogHref({
              nextTag: undefined,
              nextQ: keyword || undefined,
              nextPage: 1,
            })}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
              !selectedTag
                ? "bg-black text-white"
                : "border border-gray-300 text-gray-800 hover:bg-gray-100"
            }`}
          >
            전체 보기
          </Link>

          {selectedTag && (
            <span className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800">
              선택된 태그 · {selectedTag}
            </span>
          )}

          {keyword && (
            <span className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800">
              검색어 · {keyword}
            </span>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag: string) => {
              const isActive = selectedTag === tag;

              return (
                <Link
                  key={tag}
                  href={buildBlogHref({
                    nextTag: tag,
                    nextQ: keyword || undefined,
                    nextPage: 1,
                  })}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    isActive
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-6">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post, index) => (
            <article
              key={post.id}
              className={`rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md ${
                index === 0 && safePage === 1 && !selectedTag && !keyword
                  ? "shadow-sm"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {index === 0 && safePage === 1 && !selectedTag && !keyword && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Latest
                  </span>
                )}
                <p className="text-sm font-medium text-gray-500">
                  작성일 · {formatDate(post.created_at)}
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                {post.title}
              </h2>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={buildBlogHref({
                        nextTag: tag,
                        nextQ: keyword || undefined,
                        nextPage: 1,
                      })}
                      className={`rounded-full px-3 py-1 text-sm transition ${
                        selectedTag === tag
                          ? "bg-black text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {post.summary && (
                <p className="text-gray-600 leading-8 mb-6">{post.summary}</p>
              )}

              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold text-gray-900 underline underline-offset-4"
              >
                글 보러 가기
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600 mb-4">
              {selectedTag && keyword
                ? `"${selectedTag}" 태그와 "${keyword}" 검색어에 해당하는 글이 없습니다.`
                : selectedTag
                ? `"${selectedTag}" 태그에 해당하는 글이 아직 없습니다.`
                : keyword
                ? `"${keyword}" 검색어에 해당하는 글이 없습니다.`
                : "아직 발행된 글이 없습니다."}
            </p>

            {(selectedTag || keyword) && (
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                전체 글 보러 가기
              </Link>
            )}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <section className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {safePage > 1 && (
            <Link
              href={buildBlogHref({
                nextTag: selectedTag || undefined,
                nextQ: keyword || undefined,
                nextPage: safePage - 1,
              })}
              className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              이전
            </Link>
          )}

          <span className="text-sm text-gray-500">
            {safePage} / {totalPages}
          </span>

          {safePage < totalPages && (
            <Link
              href={buildBlogHref({
                nextTag: selectedTag || undefined,
                nextQ: keyword || undefined,
                nextPage: safePage + 1,
              })}
              className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              다음
            </Link>
          )}
        </section>
      )}
    </main>
  );
}