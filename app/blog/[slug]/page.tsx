import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type PostItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  created_at: string;
  tags?: string[] | null;
};

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

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, summary, content, created_at, tags")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !posts || posts.length === 0) {
    notFound();
  }

  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const post = posts[currentIndex];
  const previousPost = posts[currentIndex - 1] ?? null;
  const nextPost = posts[currentIndex + 1] ?? null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm font-semibold text-gray-500 underline underline-offset-4 mb-10"
      >
        ← Blog로 돌아가기
      </Link>

      <article>
        <p className="text-sm text-gray-500 mb-5">
          {formatDate(post.created_at)}
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {post.summary && (
          <p className="text-lg text-gray-600 leading-8 mb-12">
            {post.summary}
          </p>
        )}

        <div className="space-y-6 whitespace-pre-wrap text-lg text-gray-700 leading-8">
          {post.content}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              {previousPost ? (
                <Link
                  href={`/blog/${previousPost.slug}`}
                  className="block rounded-3xl border border-gray-200 p-5 transition hover:shadow-sm"
                >
                  <p className="text-sm text-gray-500 mb-2">이전 글</p>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {previousPost.title}
                  </h2>
                </Link>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 p-5 text-gray-400">
                  <p className="text-sm">이전 글 없음</p>
                </div>
              )}
            </div>

            <div>
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="block rounded-3xl border border-gray-200 p-5 transition hover:shadow-sm"
                >
                  <p className="text-sm text-gray-500 mb-2">다음 글</p>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {nextPost.title}
                  </h2>
                </Link>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 p-5 text-gray-400">
                  <p className="text-sm">다음 글 없음</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              Blog 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}