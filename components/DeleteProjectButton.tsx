"use client";

export default function DeleteProjectButton({
  projectId,
  action,
}: {
  projectId: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm("정말 이 프로젝트를 삭제할까요?");
        if (!ok) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={projectId} />
      <button
        type="submit"
        className="inline-flex items-center rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        삭제
      </button>
    </form>
  );
}