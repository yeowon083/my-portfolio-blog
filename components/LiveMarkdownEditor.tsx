"use client";

import { useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";

type LiveMarkdownEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  emptyText?: string;
};

export default function LiveMarkdownEditor({
  label,
  value,
  onChange,
  rows = 16,
  placeholder,
  emptyText = "내용을 입력하면 여기에 표시됩니다.",
}: LiveMarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "live">("edit");
  const isLive = mode === "live";

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !isLive ? "bg-white text-black shadow-sm" : "text-gray-500"
            }`}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setMode("live")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isLive ? "bg-white text-black shadow-sm" : "text-gray-500"
            }`}
          >
            라이브
          </button>
        </div>
      </div>

      {isLive ? (
        <div className="min-h-80 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-gray-400">{emptyText}</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      )}
    </div>
  );
}
