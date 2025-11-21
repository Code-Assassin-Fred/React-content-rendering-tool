"use client";
import React, { useEffect, useRef, useState } from "react";
import { sanitize } from "@/lib/sanitize";

interface Props {
  content: string;
}

export default function TextbookRenderer({ content }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const raw = sanitize(content);
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Generate TOC from headings
    const headings = el.querySelectorAll("h1, h2, h3, h4");
    const list: { id: string; text: string }[] = [];

    headings.forEach((h, i) => {
      const id = `h-${i}`;
      h.id = id;
      if (!h.textContent) return;
      list.push({ id, text: h.textContent });
      h.className =
        h.tagName === "H1"
          ? "text-3xl font-bold mt-8 mb-4"
          : h.tagName === "H2"
          ? "text-2xl font-semibold mt-6 mb-3"
          : "text-xl font-semibold mt-4 mb-2";
    });

    setToc(list);

    // Apply classes to other elements
    el.querySelectorAll("p").forEach((p) => {
      if (!p.className) p.className = "my-3 leading-relaxed";
    });

    el.querySelectorAll("ul").forEach((ul) => {
      ul.className = "list-disc ml-6 my-3";
    });

    el.querySelectorAll("ol").forEach((ol) => {
      ol.className = "list-decimal ml-6 my-3";
    });

    el.querySelectorAll("pre").forEach((pre) => {
      pre.className =
        "bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-4";
    });

    el.querySelectorAll("img").forEach((img) => {
      img.className = "mx-auto my-6 rounded-lg shadow";
    });

    el.querySelectorAll("table").forEach((table) => {
      table.className =
        "w-full border border-gray-300 my-6 text-sm bg-white shadow";
      table.querySelectorAll("th").forEach((th) => {
        th.className = "bg-gray-100 border p-2 text-left font-semibold";
      });
      table.querySelectorAll("td").forEach((td) => {
        td.className = "border p-2";
      });
    });

    el.querySelectorAll("blockquote").forEach((bq) => {
      bq.className =
        "border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700";
    });
  }, [raw]);

  return (
    <div className="flex gap-6">
      {/* Table of Contents */}
      <aside className="w-64 p-4 bg-gray-50 border overflow-auto h-screen sticky top-0">
        <h2 className="font-bold text-lg mb-2">Contents</h2>
        <ul className="space-y-1">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-blue-600 hover:underline">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Rendered HTML */}
      <main
        ref={ref}
        className="prose max-w-4xl"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    </div>
  );
}
