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
      <main className="page-shell">
        <h1 className="text-4xl font-bold mb-6">{category.name}</h1>
        <p className="text-red-600">글 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const typedPosts: Post[] = (posts ?? []) as Post[];

  return (
    <main className="page-shell">
      <Link
        href="/blog"
        className="back-link"
      >
        ← Blog로 돌아가기
      </Link>

      <section className="hero-panel fade-up mb-14">
        <p className="kicker mb-4">
          Category
        </p>

        <h1 className="page-title mb-6">
          {category.name}
        </h1>

        <p className="body-copy">
          {category.name} 카테고리에 속한 글
        </p>
      </section>

      <section className="space-y-6">
        {typedPosts.length > 0 ? (
          typedPosts.map((post, index) => (
            <article
              key={post.id}
              className={`surface-card hover-lift p-5 fade-up sm:p-7 ${
                index === 0 ? "border-neutral-300" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {index === 0 && (
                  <span className="chip-active text-xs">
                    Latest
                  </span>
                )}

                <p className="text-sm font-medium text-neutral-400">
                  작성일 · {formatDate(post.created_at)}
                </p>
              </div>

              <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-all duration-200 hover:text-neutral-400"
                >
                  {post.title}
                </Link>
              </h2>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="chip"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

            </article>
          ))
        ) : (
          <div className="surface-card border-dashed p-8 text-center">
            <p className="text-neutral-400 mb-4">
              이 카테고리에 아직 글이 없습니다.
            </p>

            <Link
              href="/blog"
              className="button-secondary"
            >
              전체 글 보러 가기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
