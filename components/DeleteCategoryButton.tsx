"use client";

export default function DeleteCategoryButton({
  categoryId,
  action,
}: {
  categoryId: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm("정말 이 카테고리를 삭제할까요?");
        if (!ok) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={categoryId} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}