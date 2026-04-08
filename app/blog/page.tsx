import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const selectedTag = tag?.trim() ?? "";
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

  const filteredPosts = selectedTag
    ? (posts ?? []).filter((post) => post.tags?.includes(selectedTag))
    : posts ?? [];

  const allTags = Array.from(
    new Set((posts ?? []).flatMap((post) => post.tags ?? []))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <section className="mb-14 max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
          Blog
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          프로젝트를 만들며 배우고 기록한
          <br />
          생각과 과정을 정리합니다
        </h1>

        <p className="text-lg text-gray-600 leading-8">
          실제 프로젝트를 진행하면서 무엇을 고민했고 어떻게 구현했는지,
          어떤 시행착오를 겪었는지를 중심으로 기록하고 있습니다.
        </p>
      </section>

      <section className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/blog"
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
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isActive = selectedTag === tag;

              return (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
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
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className={`rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-0.5 hover:shadow-md ${
                index === 0 && !selectedTag ? "shadow-sm" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {index === 0 && !selectedTag && (
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
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
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
            <p className="text-gray-600">
              {selectedTag
                ? `"${selectedTag}" 태그에 해당하는 글이 없습니다.`
                : "아직 발행된 글이 없습니다."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}