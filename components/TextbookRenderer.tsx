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

    const headings = el.querySelectorAll("h1, h2, h3, h4");
    const list: { id: string; text: string }[] = [];

    headings.forEach((h, i) => {
      const id = `h-${i}`;
      h.id = id;
      if (!h.textContent) return;
      list.push({ id, text: h.textContent });

      h.className =
        h.tagName === "H1"
          ? "text-4xl font-bold mt-12 mb-6 tracking-tight text-gray-900"
          : h.tagName === "H2"
          ? "text-3xl font-semibold mt-10 mb-4 tracking-tight text-gray-800"
          : h.tagName === "H3"
          ? "text-2xl font-semibold mt-8 mb-3 text-gray-800"
          : "text-xl font-semibold mt-6 mb-2 text-gray-700";
    });

    setToc(list);

    el.querySelectorAll("p").forEach((p) => {
      if (!p.className)
        p.className = "my-4 leading-relaxed text-gray-800 text-lg";
    });

    el.querySelectorAll("ul").forEach((ul) => {
      ul.className = "list-disc ml-8 my-4 space-y-2 text-gray-800 text-lg";
    });

    el.querySelectorAll("ol").forEach((ol) => {
      ol.className = "list-decimal ml-8 my-4 space-y-2 text-gray-800 text-lg";
    });

    el.querySelectorAll("pre").forEach((pre) => {
      pre.className =
        "bg-gray-900 text-white p-4 rounded-xl overflow-x-auto my-6 shadow-lg";
    });

    el.querySelectorAll("img").forEach((img) => {
      img.className = "mx-auto my-8 rounded-xl shadow-lg";
    });

    el.querySelectorAll("table").forEach((table) => {
      table.className =
        "w-full border border-gray-300 my-8 text-base bg-white shadow rounded-lg overflow-hidden";
      table.querySelectorAll("th").forEach((th) => {
        th.className = "bg-gray-100 border p-3 text-left font-semibold";
      });
      table.querySelectorAll("td").forEach((td) => {
        td.className = "border p-3";
      });
    });

    el.querySelectorAll("blockquote").forEach((bq) => {
      bq.className =
        "border-l-4 border-blue-500 pl-6 py-2 italic my-6 text-gray-700 bg-blue-50 rounded-r-lg";
    });
  }, [raw]);

  return (
    <div className="flex gap-6 w-full">
      {/* Table of Contents */}
      <aside className="w-72 p-6 bg-gray-50 border-r overflow-auto h-screen sticky top-0 shadow-sm rounded-r-xl">
        <h2 className="font-bold text-xl mb-4 tracking-tight text-gray-800">Contents</h2>
        <ul className="space-y-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-blue-600 hover:underline hover:text-blue-800 text-lg"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Rendered HTML */}
      <main
        ref={ref}
        className="max-w-5xl w-full bg-white shadow-xl rounded-2xl p-10 leading-relaxed tracking-wide text-gray-900"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    </div>
  );
}