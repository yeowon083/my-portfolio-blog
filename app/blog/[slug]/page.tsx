import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/ViewTracker";
import CommentSection from "@/components/CommentSection";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type RawPostItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
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
  summary: string | null;
  content: string;
  created_at: string;
  tags?: string[] | null;
  is_published?: boolean;
  view_count?: number | null;
  category_id?: string | null;
  category?: Category | null;
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
    .select("title, summary")
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
    description: post.summary ?? "블로그 글 상세 페이지",
    openGraph: {
      title: post.title,
      description: post.summary ?? "블로그 글 상세 페이지",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? "블로그 글 상세 페이지",
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

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      summary,
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
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !post) {
    notFound();
  }

  const rawPost = post as RawPostItem;

  const typedPost: PostItem = {
    ...rawPost,
    category: normalizeCategory(rawPost.category),
  };

  const category = typedPost.category ?? null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm font-semibold text-gray-500 underline underline-offset-4 mb-10"
      >
        ← Blog로 돌아가기
      </Link>

      <article>
        <ViewTracker slug={typedPost.slug} />

        <p className="text-sm text-gray-500 mb-5">
          {formatDate(typedPost.created_at)} · 조회수 {typedPost.view_count ?? 0}
        </p>

        {category?.name && category?.slug && (
          <Link
            href={`/blog/category/${category.slug}`}
            className="inline-block text-sm font-semibold tracking-[0.12em] text-gray-500 uppercase mb-4 underline underline-offset-4 hover:text-gray-800"
          >
            {category.name}
          </Link>
        )}

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          {typedPost.title}
        </h1>

        {typedPost.tags && typedPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {typedPost.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {typedPost.summary && (
          <p className="text-lg text-gray-600 leading-8 mb-12">
            {typedPost.summary}
          </p>
        )}

        <div className="prose max-w-none prose-headings:mt-4 prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2 prose-p:my-2 prose-hr:my-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          >
            {typedPost.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
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