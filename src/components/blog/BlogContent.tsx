import React from "react";

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "p"; text: string };

function parseBlocks(raw: string): Block[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = normalized.split(/\n{2,}/g);

  return chunks.map((chunk) => {
    const lines = chunk.split("\n").map((l) => l.trimEnd());
    const first = lines[0]?.trim() ?? "";

    if (first.startsWith("## ")) {
      return { type: "h2", text: first.replace(/^##\s+/, "") };
    }
    if (first.startsWith("### ")) {
      return { type: "h3", text: first.replace(/^###\s+/, "") };
    }
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return { type: "ul", items: lines.map((l) => l.trim().replace(/^-+\s+/, "")) };
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
      return { type: "ol", items: lines.map((l) => l.trim().replace(/^\d+\.\s+/, "")) };
    }
    if (first.startsWith(">")) {
      return { type: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join("\n").trim() };
    }

    return { type: "p", text: lines.join("\n").trim() };
  });
}

function renderWithLineBreaks(text: string) {
  const parts = text.split("\n");
  return parts.map((p, idx) => (
    <React.Fragment key={idx}>
      {p}
      {idx < parts.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

export function BlogContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert max-w-none break-words [&_p]:my-3 sm:[&_p]:my-4 [&_p]:leading-7 sm:[&_p]:leading-7 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg sm:[&_h3]:text-xl [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1 [&_a]:break-all [&_a]:whitespace-normal [&_a]:[overflow-wrap:anywhere] [&_code]:break-words [&_code]:whitespace-normal [&_pre]:overflow-x-auto">
      {blocks.map((b, idx) => {
        if (b.type === "h2") return <h2 key={idx}>{b.text}</h2>;
        if (b.type === "h3") return <h3 key={idx}>{b.text}</h3>;
        if (b.type === "ul")
          return (
            <ul key={idx}>
              {b.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          );
        if (b.type === "ol")
          return (
            <ol key={idx}>
              {b.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
          );
        if (b.type === "quote")
          return (
            <blockquote key={idx}>
              {renderWithLineBreaks(b.text)}
            </blockquote>
          );
        return <p key={idx}>{renderWithLineBreaks(b.text)}</p>;
      })}
    </div>
  );
}


