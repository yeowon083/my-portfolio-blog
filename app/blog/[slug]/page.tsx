import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/ViewTracker";
import CommentSection from "@/components/CommentSection";
import MarkdownContent from "@/components/MarkdownContent";
import { getCategoryLabel, isMissingParentIdError } from "@/lib/categories";

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

type RawPostItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  tags?: string[] | null;
  is_published?: boolean;
  view_count?: number | null;
  category_id?: string | null;
  category?: Category | Category[] | null;
};

type PostItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  tags?: string[] | null;
  is_published?: boolean;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    return {
      title: "Blog",
      description: "블로그 글 상세 페이지",
    };
  }

  return {
    title: post.title,
    description: "블로그 글 상세 페이지",
    openGraph: {
      title: post.title,
      description: "블로그 글 상세 페이지",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: "블로그 글 상세 페이지",
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user && user.email === "yeowon083@gmail.com";

  const postSelectWithParent = `
      id,
      title,
      slug,
      content,
      created_at,
      tags,
      is_published,
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
      content,
      created_at,
      tags,
      is_published,
      view_count,
      category_id,
      category:categories!posts_category_id_fkey (
        id,
        name,
        slug
      )
    `;

  let postResult: SupabaseResult = await supabase
    .from("posts")
    .select(postSelectWithParent)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (isMissingParentIdError(postResult.error)) {
    postResult = await supabase
      .from("posts")
      .select(postSelect)
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
  }

  const { data: post, error } = postResult;

  if (error || !post) {
    notFound();
  }

  const rawPost = post as RawPostItem;

  const typedPost: PostItem = {
    ...rawPost,
    category: normalizeCategory(rawPost.category),
  };

  const category = typedPost.category ?? null;
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
  const allCategories = (categories ?? []) as Category[];

  return (
    <main className="page-shell">
      <Link
        href="/blog"
        className="back-link"
      >
        ← Blog로 돌아가기
      </Link>

      <article className="surface-card p-8 fade-up">
        <ViewTracker slug={typedPost.slug} />

        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
          {formatDate(typedPost.created_at)} · 조회수 {typedPost.view_count ?? 0}
        </p>

        {category?.name && category?.slug && (
          <Link
            href={`/blog/category/${category.slug}`}
            className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-neutral-400 underline underline-offset-4 transition-all duration-200 hover:text-neutral-950"
          >
            {getCategoryLabel(category, allCategories)}
          </Link>
        )}

        <h1 className="page-title mb-6">
          {typedPost.title}
        </h1>

        {typedPost.tags && typedPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {typedPost.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?q=${encodeURIComponent(tag)}`}
                className="chip"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <MarkdownContent content={typedPost.content} />

        <div className="mt-16 pt-8 border-t border-neutral-100">
          <Link
            href="/blog"
            className="button-secondary"
          >
            Blog 목록으로 돌아가기
          </Link>
        </div>

        <CommentSection
          targetType="post"
          targetId={typedPost.id}
          isAdmin={isAdmin}
        />
      </article>
    </main>
  );
}
