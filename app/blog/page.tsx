import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getCategoryLabel,
  getCategoryOptions,
  getParentCategory,
  getTopLevelCategories,
  isMissingParentIdError,
} from "@/lib/categories";

export const metadata: Metadata = {
  title: "Blog",
  description: "글 목록",
};

const POSTS_PER_PAGE = 5;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
};

type RawPost = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  tags?: string[] | null;
  view_count?: number | null;
  category_id?: string | null;
  category?: Category | Category[] | null;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  tags?: string[] | null;
  view_count?: number | null;
  category_id?: string | null;
  category?: Category | null;
};

type SupabaseResult = {
  data: unknown;
  error: { message?: string } | null;
};

function normalizeCategory(
  category: Category | Category[] | null | undefined
): Category | null {
  if (!category) return null;
  return Array.isArray(category) ? category[0] ?? null : category;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tag?: string;
    q?: string;
    page?: string;
    category?: string;
  }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const tag = resolvedSearchParams.tag;
  const q = resolvedSearchParams.q;
  const page = resolvedSearchParams.page;
  const category = resolvedSearchParams.category;

  const selectedTag = tag?.trim() ?? "";
  const keyword = q?.trim().toLowerCase() ?? "";
  const selectedCategory = category?.trim() ?? "";
  const currentPage = Math.max(1, Number(page) || 1);

  const supabase = await createClient();

  const postSelectWithParent = `
      id,
      title,
      slug,
      created_at,
      tags,
      view_count,
      category_id,
      category:categories!posts_category_id_fkey (
        id,
        name,
        slug,
        parent_id
      )
    `;
  const postSelect = `
      id,
      title,
      slug,
      created_at,
      tags,
      view_count,
      category_id,
      category:categories!posts_category_id_fkey (
        id,
        name,
        slug
      )
    `;

  let postsResult: SupabaseResult = await supabase
    .from("posts")
    .select(postSelectWithParent)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (isMissingParentIdError(postsResult.error)) {
    postsResult = await supabase
      .from("posts")
      .select(postSelect)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
  }

  const { data: posts, error } = postsResult;

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <p className="text-red-600">글 목록을 불러오는 중 오류가 발생했습니다.</p>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
          {error.message}
        </pre>
      </main>
    );
  }

  const typedPosts: Post[] = ((posts ?? []) as RawPost[]).map((post) => ({
    ...post,
    category: normalizeCategory(post.category),
  }));

  let categoriesResult: SupabaseResult = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  if (isMissingParentIdError(categoriesResult.error)) {
    categoriesResult = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });
  }

  const { data: categories } = categoriesResult;

  const categoryList = (categories ?? []) as Category[];
  const allCategories = getCategoryOptions(categoryList);
  const topLevelCategories = getTopLevelCategories(categoryList);
  const selectedCategoryItem =
    allCategories.find((item) => item.slug === selectedCategory) ?? null;
  const selectedParentCategory = selectedCategoryItem?.parent_id
    ? getParentCategory(selectedCategoryItem, allCategories)
    : selectedCategoryItem;
  const childCategories = selectedParentCategory
    ? allCategories.filter(
        (category) => category.parent_id === selectedParentCategory.id
      )
    : [];

  let filteredPosts = typedPosts;

  if (selectedTag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags?.includes(selectedTag)
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.category?.slug === selectedCategory ||
        (!!selectedCategoryItem &&
          post.category?.parent_id === selectedCategoryItem.id)
    );
  }

  if (keyword) {
    filteredPosts = filteredPosts.filter((post) => {
      const inTitle = 
    post.title.toLowerCase().includes(keyword);
      const inTags = (post.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(keyword)
      );

      return inTitle || inTags;
    });
  }

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
    nextCategory,
  }: {
    nextTag?: string;
    nextQ?: string;
    nextPage?: number;
    nextCategory?: string;
  }) {
    const params = new URLSearchParams();

    if (nextTag) params.set("tag", nextTag);
    if (nextQ) params.set("q", nextQ);
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    return queryString ? `/blog?${queryString}` : "/blog";
  }

  function buildResetSearchHref() {
    return buildBlogHref({
      nextTag: selectedTag || undefined,
      nextQ: undefined,
      nextPage: 1,
      nextCategory: selectedCategory || undefined,
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <section className="mb-14 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Blog
        </p>

        {selectedTag || selectedCategory ? (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {selectedCategory && (
                <>
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Category
                  </span>
                  <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                    {selectedCategoryItem
                      ? getCategoryLabel(selectedCategoryItem, allCategories)
                      : selectedCategory}
                  </span>
                </>
              )}

              {selectedTag && (
                <>
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Tag
                  </span>
                  <span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
                    {selectedTag}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              조건에 맞는 글을
              <br />
              모아봤어요
            </h1>

            <p className="text-lg text-gray-600 leading-8 mb-6">
              현재{" "}
              {selectedCategory && (
                <span className="font-semibold text-gray-900">
                  카테고리{" "}
                  {selectedCategoryItem
                    ? getCategoryLabel(selectedCategoryItem, allCategories)
                    : selectedCategory}
                </span>
              )}
              {selectedCategory && selectedTag && <span> · </span>}
              {selectedTag && (
                <span className="font-semibold text-gray-900">
                  태그 {selectedTag}
                </span>
              )}{" "}
              조건이 적용된 글을 보고 있습니다.
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
              블로그 글 목록
            </h1>

            <p className="text-lg text-gray-600 leading-8">
              기록하고, 정리하고, 공유합니다.
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
            placeholder="제목, 태그 검색"
            className="min-w-[260px] flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          {selectedTag && <input type="hidden" name="tag" value={selectedTag} />}
          {selectedCategory && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}

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
        {topLevelCategories.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap gap-2">
            <Link
              href={buildBlogHref({
                nextCategory: undefined,
                nextTag: selectedTag || undefined,
                nextQ: keyword || undefined,
                nextPage: 1,
              })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !selectedCategory
                  ? "bg-black text-white"
                  : "border border-gray-300 text-gray-800 hover:bg-gray-100"
              }`}
            >
              전체 카테고리
            </Link>

            {topLevelCategories.map((category) => {
              const isActive = selectedCategory === category.slug;

              return (
                <Link
                  key={category.id}
                  href={buildBlogHref({
                    nextCategory: category.slug,
                    nextTag: selectedTag || undefined,
                    nextQ: keyword || undefined,
                    nextPage: 1,
                  })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-black text-white"
                      : "border border-gray-300 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
            </div>

            {childCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {childCategories.map((category) => {
                  const isActive = selectedCategory === category.slug;

                  return (
                    <Link
                      key={category.id}
                      href={buildBlogHref({
                        nextCategory: category.slug,
                        nextTag: selectedTag || undefined,
                        nextQ: keyword || undefined,
                        nextPage: 1,
                      })}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">

          {selectedCategory && (
            <span className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800">
              선택된 카테고리 ·{" "}
              {selectedCategoryItem
                ? getCategoryLabel(selectedCategoryItem, allCategories)
                : selectedCategory}
            </span>
          )}

          {keyword && (
            <span className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800">
              검색어 · {keyword}
            </span>
          )}
        </div>

      </section>

      <section className="space-y-6">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post, index) => (
            <article
              key={post.id}
              className={`rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md ${
                index === 0 &&
                safePage === 1 &&
                !selectedTag &&
                !keyword &&
                !selectedCategory
                  ? "shadow-sm"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {index === 0 &&
                  safePage === 1 &&
                  !selectedTag &&
                  !keyword &&
                  !selectedCategory && (
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      Latest
                    </span>
                  )}

                <p className="text-sm font-medium text-gray-500">
                  {post.category?.slug && post.category?.name && (
                    <>
                      카테고리:{" "}
                      <Link
                        href={`/blog/category/${post.category.slug}`}
                        className="underline underline-offset-4 hover:text-gray-800"
                      >
                        {getCategoryLabel(post.category, allCategories)}
                      </Link>{" "}
                      ·{" "}
                    </>
                  )}
                  작성일: {formatDate(post.created_at)} · 조회수{" "}
                  {post.view_count ?? 0}
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-gray-600"
                >
                  {post.title}
                </Link>
              </h2>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={buildBlogHref({
                        nextTag: tag,
                        nextQ: keyword || undefined,
                        nextPage: 1,
                        nextCategory: selectedCategory || undefined,
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

            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600 mb-4">
              {selectedCategory && selectedTag && keyword
                ? `선택한 카테고리, 태그, 검색어에 해당하는 글이 없습니다.`
                : selectedCategory && selectedTag
                ? `선택한 카테고리와 태그에 해당하는 글이 없습니다.`
                : selectedCategory && keyword
                ? `선택한 카테고리와 검색어에 해당하는 글이 없습니다.`
                : selectedTag && keyword
                ? `선택한 태그와 검색어에 해당하는 글이 없습니다.`
                : selectedCategory
                ? `선택한 카테고리에 해당하는 글이 아직 없습니다.`
                : selectedTag
                ? `선택한 태그에 해당하는 글이 아직 없습니다.`
                : keyword
                ? `"${keyword}" 검색어에 해당하는 글이 없습니다.`
                : "아직 발행된 글이 없습니다."}
            </p>

            {(selectedCategory || selectedTag || keyword) && (
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
                nextCategory: selectedCategory || undefined,
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
                nextCategory: selectedCategory || undefined,
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
