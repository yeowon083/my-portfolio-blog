import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import DeletePostButton from "@/components/DeletePostButton";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.email !== "yeowon083@gmail.com") {
    redirect("/");
  }

  let query = supabase
    .from("posts")
    .select("id, title, slug, is_published, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (status === "published") {
    query = query.eq("is_published", true);
  }

  if (status === "draft") {
    query = query.eq("is_published", false);
  }

  if (q && q.trim()) {
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data: posts, error } = await query;

  const isAll = !status;
  const isPublished = status === "published";
  const isDraft = status === "draft";
  const keyword = q?.trim() ?? "";

  function buildHref(nextStatus?: string) {
    const params = new URLSearchParams();

    if (nextStatus) {
      params.set("status", nextStatus);
    }

    if (keyword) {
      params.set("q", keyword);
    }

    const queryString = params.toString();
    return queryString ? `/admin/posts?${queryString}` : "/admin/posts";
  }

  function buildResetHref() {
    return status ? `/admin/posts?status=${status}` : "/admin/posts";
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">글 관리</h1>
        <p className="text-red-600">글 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-2">
            Admin
          </p>
          <h1 className="text-4xl font-bold tracking-tight">글 관리</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            새 글 작성
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      <form action="/admin/posts" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={keyword}
            placeholder="제목 또는 slug 검색"
            className="min-w-[260px] flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          {status && <input type="hidden" name="status" value={status} />}

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            검색
          </button>

          {keyword && (
            <Link
              href={buildResetHref()}
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              검색 초기화
            </Link>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href={buildHref(undefined)}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
            isAll
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-800 hover:bg-gray-100"
          }`}
        >
          전체
        </Link>

        <Link
          href={buildHref("published")}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
            isPublished
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-800 hover:bg-gray-100"
          }`}
        >
          발행됨
        </Link>

        <Link
          href={buildHref("draft")}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
            isDraft
              ? "bg-black text-white"
              : "border border-gray-300 text-gray-800 hover:bg-gray-100"
          }`}
        >
          초안
        </Link>
      </div>

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">/blog/{post.slug}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>상태: {post.is_published ? "발행됨" : "초안"}</p>
                    <p>작성일: {formatDate(post.created_at)}</p>
                    <p>수정일: {formatDate(post.updated_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    공개 글 보기
                  </Link>

                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    수정
                  </Link>

                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600 mb-4">조건에 맞는 글이 없습니다.</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              새 글 작성하기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}