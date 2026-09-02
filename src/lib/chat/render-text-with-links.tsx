import type { ReactNode } from "react";

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export function renderTextWithLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKDOWN_LINK_PATTERN)) {
    const fullMatch = match[0];
    const label = match[1];
    const href = match[2];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const isExternal = /^https?:\/\//.test(href);

    parts.push(
      <a
        key={`${index}-${href}`}
        href={href}
        className="font-medium underline underline-offset-2"
        {...(isExternal
          ? { target: "_blank", rel: "noreferrer" }
          : undefined)}
      >
        {label}
      </a>,
    );

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
