"use client";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  content: string;
}

// Simple sanitization (replace with your actual sanitize function)
const sanitize = (html: string) => html;

export default function TextbookRenderer({ content }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const raw = sanitize(content);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const headings = el.querySelectorAll("h1, h2, h3, h4");
    const list: { id: string; text: string; level: number }[] = [];

    headings.forEach((h, i) => {
      const id = `h-${i}`;
      h.id = id;
      if (!h.textContent) return;
      
      const level = parseInt(h.tagName[1]);
      list.push({ id, text: h.textContent, level });

      h.className =
        h.tagName === "H1"
          ? "text-4xl font-bold mt-12 mb-6 text-slate-900"
          : h.tagName === "H2"
          ? "text-3xl font-semibold mt-10 mb-5 text-slate-800 border-b-2 border-slate-200 pb-2"
          : h.tagName === "H3"
          ? "text-2xl font-semibold mt-8 mb-3 text-slate-800"
          : "text-xl font-semibold mt-6 mb-2 text-slate-700";
    });

    setToc(list);

    el.querySelectorAll("p").forEach((p) => {
      if (!p.className)
        p.className = "my-4 leading-relaxed text-slate-700 text-base";
    });

    el.querySelectorAll("ul").forEach((ul) => {
      ul.className = "list-disc ml-6 my-4 space-y-2 text-slate-700";
    });

    el.querySelectorAll("ol").forEach((ol) => {
      ol.className = "list-decimal ml-6 my-4 space-y-2 text-slate-700";
    });

    el.querySelectorAll("li").forEach((li) => {
      if (!li.className)
        li.className = "leading-relaxed";
    });

    el.querySelectorAll("pre").forEach((pre) => {
      pre.className =
        "bg-slate-900 text-slate-100 p-5 rounded-lg overflow-x-auto my-6 shadow-md text-sm";
    });

    el.querySelectorAll("img").forEach((img) => {
      img.className = "mx-auto my-8 rounded-lg shadow-md max-w-full";
    });

    el.querySelectorAll("table").forEach((table) => {
      table.className =
        "w-full border-collapse my-8 text-sm bg-white shadow-sm rounded-lg overflow-hidden";
      table.querySelectorAll("th").forEach((th) => {
        th.className = "bg-slate-100 border border-slate-300 p-3 text-left font-semibold text-slate-800";
      });
      table.querySelectorAll("td").forEach((td) => {
        td.className = "border border-slate-300 p-3 text-slate-700";
      });
    });

    el.querySelectorAll("blockquote").forEach((bq) => {
      bq.className =
        "border-l-4 border-teal-500 pl-6 py-3 my-6 text-slate-700 bg-teal-50 rounded-r-lg italic";
    });

    el.querySelectorAll("strong, b").forEach((strong) => {
      if (!strong.className)
        strong.className = "font-semibold text-slate-900";
    });

    el.querySelectorAll("em, i").forEach((em) => {
      if (!em.className)
        em.className = "italic text-slate-800";
    });
  }, [raw]);

  return (
    <div className="flex gap-6 w-full">
      {/* Table of Contents */}
      {toc.length > 0 && (
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-6 p-5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm max-h-[calc(100vh-3rem)] overflow-auto">
            <h2 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Contents
            </h2>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}>
                  <a
                    href={`#${item.id}`}
                    className="block py-1.5 px-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded transition-colors duration-150"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* Rendered HTML */}
      <main
        ref={ref}
        className="flex-1 bg-white shadow-sm rounded-xl p-8 lg:p-12 max-w-4xl"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    </div>
  );
}