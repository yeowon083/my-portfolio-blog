import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function createCategory(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "yeowon083@gmail.com") {
    redirect("/");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  if (!name || !slug) {
    redirect("/admin/categories");
  }

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
  });

  if (error) {
    redirect("/admin/categories");
  }

  redirect("/admin/categories");
}

export default async function AdminCategoriesPage() {
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
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">카테고리 관리</h1>
        <p className="text-red-600">카테고리 목록을 불러오는 중 오류가 발생했습니다.</p>
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
          <h1 className="text-4xl font-bold tracking-tight">카테고리 관리</h1>
        </div>

        <Link
          href="/admin/posts"
          className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
        >
          글 관리로 돌아가기
        </Link>
      </div>

      <section className="rounded-3xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">새 카테고리 추가</h2>

        <form action={createCategory} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              카테고리 이름
            </label>
            <input
              type="text"
              name="name"
              placeholder="예: 프로젝트"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              슬러그
            </label>
            <input
              type="text"
              name="slug"
              placeholder="예: project"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              카테고리 추가
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <article
              key={category.id}
              className="rounded-3xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-sm text-gray-500">slug: {category.slug}</p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">아직 카테고리가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}