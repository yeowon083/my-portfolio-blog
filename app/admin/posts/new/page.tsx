import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewPostForm from "@/components/NewPostForm";

export default async function NewPostPage() {
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

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">새 글 작성</h1>
        <p className="text-red-600">카테고리 목록을 불러오는 중 오류가 발생했습니다.</p>
      </main>
    );
  }

  return <NewPostForm categories={categories ?? []} />;
}
