import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "./project-form";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  thumbnail_url: string | null;
  project_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  is_published: boolean;
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, thumbnail_url, project_url, github_url, tech_stack, is_published"
    )
    .eq("id", id)
    .single();

  if (error || !project) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">프로젝트 수정</h1>
        <p className="text-red-600">프로젝트 정보를 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  return <ProjectForm initialData={project as Project} />;
}