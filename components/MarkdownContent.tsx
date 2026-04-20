"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Components } from "react-markdown";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
  },
};

const markdownComponents: Components = {
  pre({ children, ...props }) {
    return (
      <pre
        className="rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 p-4 overflow-x-auto my-6 text-sm leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.12)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit [&>code]:rounded-none"
        {...props}
      >
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    if (className) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.9em] font-normal text-neutral-700 before:content-none after:content-none"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="content-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
