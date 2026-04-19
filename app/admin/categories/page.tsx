import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import DeleteCategoryButton from "@/components/DeleteCategoryButton";
import {
  getCategoryLabel,
  getCategoryOptions,
  getTopLevelCategories,
  hasChildCategories,
  isMissingParentIdError,
  type Category,
} from "@/lib/categories";

type SupabaseResult = {
  data: unknown;
  error: { message?: string } | null;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function assertAdmin() {
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

  return supabase;
}

async function supportsParentCategories() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .select("parent_id")
    .limit(1);

  return !isMissingParentIdError(error);
}

async function isValidParentCategory(parentId: string) {
  const supabase = await createClient();

  const { data: parent, error } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("id", parentId)
    .single();

  if (isMissingParentIdError(error)) {
    return false;
  }

  return !!parent && !parent.parent_id;
}

async function categoryHasChildren(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", categoryId)
    .limit(1);

  if (isMissingParentIdError(error)) {
    return false;
  }

  return !!data && data.length > 0;
}

async function createCategory(formData: FormData) {
  "use server";

  const supabase = await assertAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = generateSlug(slugInput || name);

  if (!name || !slug) {
    return;
  }

  const canNestCategories = await supportsParentCategories();

  if (parentId && (!canNestCategories || !(await isValidParentCategory(parentId)))) {
    return;
  }

  const insertData: {
    name: string;
    slug: string;
    parent_id?: string | null;
  } = {
    name,
    slug,
  };

  if (canNestCategories) {
    insertData.parent_id = parentId;
  }

  await supabase.from("categories").insert(insertData);

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
}

async function updateCategory(formData: FormData) {
  "use server";

  const supabase = await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = generateSlug(slugInput || name);

  if (!id || !name || !slug) {
    return;
  }

  const canNestCategories = await supportsParentCategories();

  if (parentId) {
    if (!canNestCategories || parentId === id) {
      return;
    }

    if (!(await isValidParentCategory(parentId))) {
      return;
    }

    if (await categoryHasChildren(id)) {
      return;
    }
  }

  const updateData: {
    name: string;
    slug: string;
    parent_id?: string | null;
  } = {
    name,
    slug,
  };

  if (canNestCategories) {
    updateData.parent_id = parentId;
  }

  await supabase.from("categories").update(updateData).eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
}

async function deleteCategory(formData: FormData) {
  "use server";

  const supabase = await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
}

export default async function AdminCategoriesPage() {
  const supabase = await assertAdmin();

  let categoriesResult: SupabaseResult = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  const canNestCategories = !isMissingParentIdError(categoriesResult.error);

  if (!canNestCategories) {
    categoriesResult = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });
  }

  const { data: categories, error } = categoriesResult;

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

  const typedCategories: Category[] = (categories ?? []) as Category[];
  const topLevelCategories = getTopLevelCategories(typedCategories);
  const categoryOptions = getCategoryOptions(typedCategories);

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

      {!canNestCategories && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          하위 카테고리를 사용하려면 Supabase SQL Editor에서{" "}
          <span className="font-semibold">supabase/categories-parent-id.sql</span>
          을 먼저 실행해야 합니다. 지금은 기존 단일 카테고리 관리로 동작합니다.
        </div>
      )}

      <section className="rounded-3xl border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-5">새 카테고리 추가</h2>

        <form
          action={createCategory}
          className={`grid gap-4 ${
            canNestCategories
              ? "md:grid-cols-[1fr_1fr_1fr_auto]"
              : "md:grid-cols-[1fr_1fr_auto]"
          }`}
        >
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

          {canNestCategories && (
            <select
              name="parentId"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black bg-white"
            >
              <option value="">상위 카테고리 없음</option>
              {topLevelCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
          >
            추가
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {categoryOptions.length > 0 ? (
          categoryOptions.map((category) => {
            const hasChildren = hasChildCategories(
              category.id,
              typedCategories
            );

            return (
              <article
                key={category.id}
                className="rounded-3xl border border-gray-200 p-6 shadow-sm"
              >
                <div
                  className={`grid gap-4 ${
                    canNestCategories
                      ? "md:grid-cols-[1fr_1fr_1fr_auto_auto]"
                      : "md:grid-cols-[1fr_1fr_auto_auto]"
                  }`}
                >
                  <form action={updateCategory} className="contents">
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

                    {canNestCategories && (
                      <select
                        name="parentId"
                        defaultValue={category.parent_id ?? ""}
                        disabled={hasChildren}
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        title={
                          hasChildren
                            ? "하위 카테고리가 있는 카테고리는 하위로 이동할 수 없습니다."
                            : undefined
                        }
                      >
                        <option value="">상위 카테고리 없음</option>
                        {topLevelCategories
                          .filter((parent) => parent.id !== category.id)
                          .map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name}
                            </option>
                          ))}
                      </select>
                    )}

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      수정 저장
                    </button>
                  </form>

                  <DeleteCategoryButton
                    categoryId={category.id}
                    action={deleteCategory}
                  />
                </div>

                {canNestCategories && (
                  <p className="mt-3 text-sm text-gray-500">
                    {category.parent_id
                      ? getCategoryLabel(category, typedCategories)
                      : "상위 카테고리"}
                  </p>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-600">
              아직 등록된 카테고리가 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
