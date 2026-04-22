import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MarkReadOnMount from "./MarkReadOnMount";
import AdminCommentDeleteButton from "./AdminCommentDeleteButton";

type RawComment = {
  id: string;
  author_name: string;
  content: string;
  target_type: "post" | "project";
  target_id: string;
  created_at: string;
  parent_id: string | null;
};

type ContentItem = { id: string; title: string; slug: string };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminCommentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "yeowon083@gmail.com") {
    redirect("/admin/login");
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, author_name, content, target_type, target_id, created_at, parent_id")
    .order("created_at", { ascending: false });

  const allComments = (comments ?? []) as RawComment[];

  const postIds = [...new Set(allComments.filter((c) => c.target_type === "post").map((c) => c.target_id))];
  const projectIds = [...new Set(allComments.filter((c) => c.target_type === "project").map((c) => c.target_id))];

  const [{ data: posts }, { data: projects }] = await Promise.all([
    postIds.length > 0
      ? supabase.from("posts").select("id, title, slug").in("id", postIds)
      : Promise.resolve({ data: [] }),
    projectIds.length > 0
      ? supabase.from("projects").select("id, title, slug").in("id", projectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const postMap = new Map<string, ContentItem>(
    (posts ?? []).map((p) => [p.id, p as ContentItem])
  );
  const projectMap = new Map<string, ContentItem>(
    (projects ?? []).map((p) => [p.id, p as ContentItem])
  );

  function getTarget(comment: RawComment) {
    if (comment.target_type === "post") {
      const post = postMap.get(comment.target_id);
      return post ? { label: post.title, href: `/blog/${post.slug}` } : null;
    }
    const project = projectMap.get(comment.target_id);
    return project ? { label: project.title, href: `/projects/${project.slug}` } : null;
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <MarkReadOnMount />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-2">
            Admin
          </p>
          <h1 className="text-3xl font-bold tracking-tight">댓글 관리</h1>
        </div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-gray-500 underline underline-offset-4 hover:text-gray-900"
        >
          ← 관리자 홈
        </Link>
      </div>

      {allComments.length === 0 ? (
        <p className="text-gray-500">등록된 댓글이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {allComments.map((comment) => {
            const target = getTarget(comment);
            return (
              <article
                key={comment.id}
                className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {comment.parent_id && (
                        <span className="text-xs text-neutral-400">↳ 답글</span>
                      )}
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    {target && (
                      <Link
                        href={target.href}
                        className="text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700 mb-2 inline-block"
                        target="_blank"
                      >
                        {comment.target_type === "post" ? "글" : "프로젝트"}: {target.label}
                      </Link>
                    )}

                    <p className="text-gray-700 text-sm leading-7 whitespace-pre-wrap mt-1">
                      {comment.content}
                    </p>
                  </div>

                  <AdminCommentDeleteButton commentId={comment.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
