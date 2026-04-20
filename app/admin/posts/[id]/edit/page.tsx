import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "./post-form";

export default async function EditPostPage({
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

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, is_published, tags, category_id")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">글 수정</h1>
        <p className="text-red-600">글 정보를 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  if (categoriesError) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">글 수정</h1>
        <p className="text-red-600">카테고리 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  return <PostForm initialData={post} categories={categories ?? []} />;
}
