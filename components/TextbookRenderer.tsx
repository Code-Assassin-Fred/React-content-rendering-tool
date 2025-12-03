// components/TextbookRenderer.tsx
"use client";

import React, { useMemo } from "react";
import { sanitize } from "@/lib/sanitize";

interface Props {
  content: string;
}

export default function TextbookRenderer({ content }: Props) {
  const { formattedHtml, toc } = useMemo(() => {
    let html = content?.trim();
    if (!html) {
      return {
        formattedHtml: "",
        toc: [] as Array<{ id: string; title: string; level: number }>,
      };
    }

    // 1. Remove stray markdown
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

    // 2. Sanitize
    const safe = sanitize(html);

    // 3. Transform DOM
    const container = document.createElement("div");
    container.innerHTML = safe;

    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3, h4")
    ) as HTMLHeadingElement[];

    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    const tocItems: Array<{ id: string; title: string; level: number }> = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.charAt(1), 10);
      const text = h.textContent?.trim() || "";

      // ---------- Sub-strand cards (h1 or h2) ----------
      if (level === 1 || level === 2) {
        h2Count += 1;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        const card = document.createElement("div");
        card.className =
          "substrand-card mb-12 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 overflow-hidden shadow-2xl";
        card.id = id;

        const header = document.createElement("div");
        header.className =
          "bg-gradient-to-r from-[#7c3aed]/20 to-[#a855f7]/20 border-b border-white/10 px-8 py-6 flex items-center gap-5";

        const badge = document.createElement("div");
        badge.className =
          "flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c3aed]/30 text-[#c4b5fd] text-2xl font-bold border border-[#7c3aed]/50 backdrop-blur-sm";
        badge.textContent = `${h2Count}`;

        const title = document.createElement("h2");
        title.className = "text-3xl font-bold text-white m-0";
        title.textContent = text;

        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        const body = document.createElement("div");
        body.className = "p-8 space-y-8";
        card.appendChild(body);

        // Move everything until next heading into this card
        let sibling = h.nextElementSibling;
        h.replaceWith(card);
        while (
          sibling &&
          !headings.includes(sibling as HTMLHeadingElement)
        ) {
          const next = sibling.nextElementSibling;
          body.appendChild(sibling);
          sibling = next;
        }

        tocItems.push({ id, title: text, level: 2 });
        return;
      }

      // ---------- Section h3 ----------
      if (level === 3) {
        h3Count += 1;
        h4Count = 0;
        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;

        h.id = id;
        h.className =
          "text-2xl font-bold text-sky-300 mt-10 mb-4 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span class="font-bold">${h2Count}.${h3Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // ---------- Subsection h4 ----------
      if (level === 4) {
        h4Count += 1;
        const id = `subsection-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className =
          "text-xl font-semibold text-teal-300 mt-8 mb-3 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span class="text-teal-300">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // Images
    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-xl mx-auto block max-w-full h-auto shadow-lg";
      const wrapper = document.createElement("figure");
      wrapper.className = "my-8 text-center";
      img.parentElement?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      if (img.alt) {
        const cap = document.createElement("figcaption");
        cap.className = "mt-3 text-sm text-white/60 italic";
        cap.textContent = img.alt;
        wrapper.appendChild(cap);
      }
    });

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "overflow-x-auto my-8 rounded-xl border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse";
      table.querySelector("thead")?.classList.add("bg-white/5");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-5", "py-4", "font-bold", "text-white", "border-b", "border-white/10")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-5", "py-4", "text-white/80", "border", "border-white/10")
      );

      table.querySelectorAll("tbody tr").forEach((tr, i) => {
        if (i % 2 === 1) tr.classList.add("bg-white/[0.03]");
      });
    });

    // Paragraphs & lists
    container.querySelectorAll("p").forEach((p) =>
      p.classList.add("my-4", "leading-relaxed", "text-white/90")
    );
    container.querySelectorAll("ul, ol").forEach((list) =>
      list.classList.add("my-4", "space-y-2", "text-white/90", list.tagName === "UL" ? "list-disc" : "list-decimal", "list-inside")
    );

    // Pedagogical callouts
    container.querySelectorAll("p").forEach((p) => {
      const text = p.textContent?.trim().toLowerCase() || "";
      const map: Record<string, { class: string; label: string }> = {
        "note:": { class: "bg-cyan-900/30 border-l-4 border-cyan-500", label: "Note" },
        "tip:": { class: "bg-sky-900/30 border-l-4 border-sky-500", label: "Tip" },
        "example:": { class: "bg-blue-900/30 border-l-4 border-blue-500", label: "Example" },
        "key takeaway:": { class: "bg-emerald-900/30 border-l-4 border-emerald-500", label: "Key Takeaway" },
        "activity:": { class: "bg-amber-900/30 border-l-4 border-amber-500", label: "Activity" },
        "exercise:": { class: "bg-amber-900/30 border-l-4 border-amber-500", label: "Exercise" },
      };

      for (const [key, style] of Object.entries(map)) {
        if (text.startsWith(key)) {
          const box = document.createElement("div");
          box.className = `my-6 p-5 rounded-xl ${style.class} backdrop-blur-sm`;

          const label = document.createElement("div");
          label.className = "text-xs font-bold uppercase tracking-wider text-white/70 mb-2";
          label.textContent = style.label;

          const contentDiv = document.createElement("div");
          contentDiv.className = "text-white/90";
          contentDiv.textContent = p.textContent?.trim().slice(key.length).trimStart() || "";

          box.appendChild(label);
          box.appendChild(contentDiv);
          p.replaceWith(box);
          break;
        }
      }
    });

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [content]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  return (
    <div className="text-white">
      {/* Table of Contents */}
      {toc.length > 0 && (
        <aside className="sticky top-6 mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">
            Table of Contents
          </div>
          <nav className="space-y-2">
            {toc.map((item, idx) => (
              <div
                key={item.id}
                className={`pl-${item.level === 2 ? "0" : item.level === 3 ? "6" : "12"}`}
              >
                <a
                  href={`#${item.id}`}
                  className="block py-1 text-white/80 hover:text-white transition-colors"
                >
                  {item.level === 2 && (
                    <span className="font-semibold text-[#c4b5fd] mr-2">
                      {idx + 1}.
                    </span>
                  )}
                  {item.title}
                </a>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Rendered content */}
      <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
    </div>
  );
}