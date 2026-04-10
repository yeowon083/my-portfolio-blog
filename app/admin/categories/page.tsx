import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import DeleteCategoryButton from "@/components/DeleteCategoryButton";

type Category = {
  id: string;
  name: string;
  slug: string;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createCategory(formData: FormData) {
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

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = generateSlug(slugInput || name);

  if (!name || !slug) {
    return;
  }

  await supabase.from("categories").insert({
    name,
    slug,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
}

async function updateCategory(formData: FormData) {
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
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = generateSlug(slugInput || name);

  if (!id || !name || !slug) {
    return;
  }

  await supabase
    .from("categories")
    .update({
      name,
      slug,
    })
    .eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
}

async function deleteCategory(formData: FormData) {
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

  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
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
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-4">카테고리 관리</h1>
        <p className="text-red-600">
          카테고리 목록을 불러오는 중 오류가 발생했습니다.
        </p>
      </main>
    );
  }

  const typedCategories: Category[] = categories ?? [];

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-2">
            Admin
          </p>
          <h1 className="text-4xl font-bold tracking-tight">카테고리 관리</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            글 관리
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            관리자 홈
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-5">새 카테고리 추가</h2>

        <form action={createCategory} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            name="name"
            placeholder="카테고리 이름"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <input
            name="slug"
            placeholder="slug (비워두면 이름 기준 자동 생성)"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            추가
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {typedCategories.length > 0 ? (
          typedCategories.map((category) => (
            <article
              key={category.id}
              className="rounded-3xl border border-gray-200 p-6 shadow-sm"
            >
              <form
                action={updateCategory}
                className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]"
              >
                <input type="hidden" name="id" value={category.id} />

                <input
                  name="name"
                  defaultValue={category.name}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <input
                  name="slug"
                  defaultValue={category.slug}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  수정 저장
                </button>

                <DeleteCategoryButton
                  categoryId={category.id}
                  action={deleteCategory}
                />
              </form>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-600">아직 등록된 카테고리가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}