import DeleteProjectButton from "@/components/DeleteProjectButton";   
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  is_published: boolean;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function deleteProject(formData: FormData) {
  "use server";

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

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export default async function AdminProjectsPage() {
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

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, slug, summary, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">프로젝트 관리</h1>
        <p className="text-red-600">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const typedProjects: Project[] = projects ?? [];

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-2">
            Admin
          </p>
          <h1 className="text-4xl font-bold tracking-tight">프로젝트 관리</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            글 관리
          </Link>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            새 프로젝트 작성
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        {typedProjects.length > 0 ? (
          typedProjects.map((project) => (
            <article
              key={project.id}
              className="rounded-3xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        project.is_published
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </span>

                    <p className="text-sm text-gray-500">
                      {formatDate(project.created_at)}
                    </p>
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight mb-2">
                    {project.title}
                  </h2>

                  <p className="text-sm text-gray-500 mb-4">
                    /projects/{project.slug}
                  </p>

                  {project.summary ? (
                    <p className="text-gray-600 leading-7">{project.summary}</p>
                  ) : (
                    <p className="text-gray-400 leading-7">
                      아직 요약이 입력되지 않았습니다.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    공개 보기
                  </Link>

                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    수정
                  </Link>

                  <DeleteProjectButton projectId={project.id} action={deleteProject} />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-600 mb-4">아직 등록된 프로젝트가 없습니다.</p>

            <Link
              href="/admin/projects/new"
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              첫 프로젝트 작성하기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}