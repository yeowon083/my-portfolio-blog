import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {defaultSchema} from "rehype-sanitize";

const sanitizeSchema = { 
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
};

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
  is_published?: boolean;
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

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, slug, summary, content, created_at, tags, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !post) {
    notFound();
  }

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

        <div className="prose prose-gray max-w-none prose-headings:tracking-tight prose-a:break-all">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize,
              sanitizeSchema]]}
              >
            {post.content}
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
      </article>
    </main>
  );
}