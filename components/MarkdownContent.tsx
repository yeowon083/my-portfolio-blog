"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Components } from "react-markdown";
import { Children, isValidElement, type ReactNode } from "react";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark", "span"],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
    span: [
      ["className", "md-color-red"],
      ["className", "md-color-blue"],
      ["className", "md-color-green"],
      ["className", "md-color-gray"],
      ["className", "md-color-amber"],
    ],
  },
};

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  dockerfile: "Dockerfile",
  html: "HTML",
  java: "Java",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  md: "Markdown",
  py: "Python",
  python: "Python",
  sh: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  txt: "Text",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
};

function getTextContent(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getTextContent(child.props.children);
      }

      return "";
    })
    .join("");
}

function getLanguageLabel(language: string) {
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language.toUpperCase();
}

function createHeadingId(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

function createHeadingComponent(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  function Heading({
    children,
    className,
    ...props
  }: ComponentPropsWithoutRef<typeof Tag>) {
    const text = getTextContent(children).trim();
    const id = createHeadingId(text);

    return (
      <Tag
        id={id}
        className={["scroll-mt-28", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </Tag>
    );
  }

  Heading.displayName = `Markdown${Tag.toUpperCase()}`;

  return Heading;
}

function handleHashLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  targetId: string
) {
  const target = document.getElementById(targetId);

  if (!target) {
    const allIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
    console.warn(`[TOC] ID not found: "${targetId}"`);
    console.log("[TOC] All IDs on page:", allIds);
    return;
  }

  event.preventDefault();
  const navbarHeight = 80;
  const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
  console.log(`[TOC] Scrolling to "${targetId}" at top=${top}`);
  window.scrollTo({ top, behavior: "smooth" });
  window.history.replaceState(null, "", `#${targetId}`);
}

const markdownComponents: Components = {
  h1: createHeadingComponent("h1"),
  h2: createHeadingComponent("h2"),
  h3: createHeadingComponent("h3"),
  h4: createHeadingComponent("h4"),
  h5: createHeadingComponent("h5"),
  h6: createHeadingComponent("h6"),
  a({ href, children, ...props }) {
    if (href?.startsWith("#")) {
      const rawTarget = decodeURIComponent(href.slice(1));
      const targetId = createHeadingId(rawTarget);

      return (
        <a
          href={`#${targetId}`}
          onClick={(event) => handleHashLinkClick(event, targetId)}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
  p({ children }) {
    return <p>{children}</p>;
  },
  pre({ children }) {
    const child = Children.toArray(children)[0];
    const childProps = isValidElement<{
      className?: string;
      children?: ReactNode;
    }>(child)
      ? child.props
      : null;
    const code = getTextContent(childProps?.children ?? children).replace(
      /\n$/,
      ""
    );
    const language = /language-([\w-]+)/.exec(childProps?.className || "")?.[1];

    if (language) {
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-end border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-500">
            {getLanguageLabel(language)}
          </div>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            PreTag="div"
            customStyle={{
              background: "#111827",
              borderRadius: 0,
              border: "none",
              color: "#e5e7eb",
              margin: 0,
              padding: "1rem",
              fontSize: "0.95rem",
              lineHeight: "1.7",
              overflowX: "auto",
            }}
            codeTagProps={{
              style: {
                color: "#e5e7eb",
                fontFamily: 'Consolas, "Courier New", monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <pre className="my-6 overflow-x-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-950 p-4 text-[0.95rem] leading-relaxed text-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <code>{code}</code>
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
