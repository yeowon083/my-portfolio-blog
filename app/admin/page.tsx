import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminPage() {
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

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
            Admin
          </p>

          <h1 className="text-4xl font-bold tracking-tight mb-2">
            관리자 페이지
          </h1>

          <p className="text-lg text-gray-600 leading-8">
            이 페이지에서는 블로그 글을 작성하고 수정할 수 있습니다.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/posts"
          className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
        >
          글 관리
        </Link>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
        >
          새 글 작성
        </Link>
      </div>
    </main>
  );
}