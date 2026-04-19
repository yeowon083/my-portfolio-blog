import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMissingParentIdError } from "@/lib/categories";

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

type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  created_at: string;
  tags?: string[] | null;
  view_count?: number | null;
  categories?: Category[] | null;
};

type SupabaseResult = {
  data: unknown;
  error: { message?: string } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  let categoryResult: SupabaseResult = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .single();

  if (isMissingParentIdError(categoryResult.error)) {
    categoryResult = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();
  }

  const category = categoryResult.data as Category | null;

  if (!category) {
    return {
      title: "Category",
      description: "카테고리별 블로그 글 목록",
    };
  }

  return {
    title: `${category.name} | Blog`,
    description: `${category.name} 카테고리 글 목록`,
  };
}

export default async function CategoryBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  let categoryResult: SupabaseResult = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .single();

  if (isMissingParentIdError(categoryResult.error)) {
    categoryResult = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();
  }

  const category = categoryResult.data as Category | null;
  const { error: categoryError } = categoryResult;

  if (categoryError || !category) {
    notFound();
  }

  let childCategories: { id: string }[] = [];

  if (category.parent_id !== undefined) {
    const childCategoriesResult = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id);

    childCategories = (childCategoriesResult.data ?? []) as { id: string }[];
  }

  const categoryIds = [
    category.id,
    ...childCategories.map((child) => child.id),
  ];

  const postSelectWithParent = `
      id,
      title,
      slug,
      summary,
      created_at,
      tags,
      view_count,
      categories (
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
      summary,
      created_at,
      tags,
      view_count,
      categories (
        id,
        name,
        slug
      )
    `;

  let postsResult: SupabaseResult = await supabase
    .from("posts")
    .select(postSelectWithParent)
    .eq("is_published", true)
    .in("category_id", categoryIds)
    .order("created_at", { ascending: false });

  if (isMissingParentIdError(postsResult.error)) {
    postsResult = await supabase
      .from("posts")
      .select(postSelect)
      .eq("is_published", true)
      .eq("category_id", category.id)
      .order("created_at", { ascending: false });
  }

  const { data: posts, error: postsError } = postsResult;

  if (postsError) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">{category.name}</h1>
        <p className="text-red-600">글 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const typedPosts: Post[] = (posts ?? []) as Post[];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm font-semibold text-gray-500 underline underline-offset-4 mb-10"
      >
        ← Blog로 돌아가기
      </Link>

      <section className="mb-14 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Category
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          {category.name}
        </h1>

        <p className="text-lg text-gray-600 leading-8">
          {category.name} 카테고리에 속한 글을 모아봤어요.
        </p>
      </section>

      <section className="space-y-6">
        {typedPosts.length > 0 ? (
          typedPosts.map((post, index) => (
            <article
              key={post.id}
              className={`rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md ${
                index === 0 ? "shadow-sm" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {index === 0 && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Latest
                  </span>
                )}

                <p className="text-sm font-medium text-gray-500">
                  작성일 · {formatDate(post.created_at)} · 조회수 {post.view_count ?? 0}
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                {post.title}
              </h2>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full px-3 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
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
              이 카테고리에 아직 글이 없습니다.
            </p>

            <Link
              href="/blog"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              전체 글 보러 가기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
