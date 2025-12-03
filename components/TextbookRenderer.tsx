"use client";
import React, { useMemo } from "react";
import { sanitize } from "@/lib/sanitize";

interface Props {
  content: string;
}

export default function TextbookRenderer({ content }: Props) {
  const { formattedHtml, toc } = useMemo(() => {
    let html = content?.trim();
    if (!html)
      return { formattedHtml: "", toc: [] as Array<{ id: string; title: string; level: number }> };

    // Strip markdown
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

    const safe = sanitize(html);
    const container = document.createElement("div");
    container.innerHTML = safe;

    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4")) as HTMLHeadingElement[];
    let subStrandCount = 0;
    let sectionCount = 0;
    const tocItems: Array<{ id: string; title: string; level: number }> = [];
    let currentSubStrandCard: HTMLDivElement | null = null;

    headings.forEach((h) => {
      const level = parseInt(h.tagName.substring(1), 10);
      const text = h.textContent?.trim() || "";

      // SubStrand H2
      if (level === 2) {
        subStrandCount += 1;
        sectionCount = 0;
        const id = `substrand-${subStrandCount}-${slugify(text)}`;

        // Only create card if not already wrapped
        if (!h.parentElement?.classList.contains("substrand-card")) {
          const card = document.createElement("div");
          card.className =
            "substrand-card mb-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 overflow-hidden shadow-lg";
          card.id = id;

          // Header
          const header = document.createElement("div");
          header.className = "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-5 flex items-center gap-3";

          const badge = document.createElement("div");
          badge.className = "flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-sm border border-blue-400/30";
          badge.textContent = `${subStrandCount}`;

          const title = document.createElement("h2");
          title.className = "text-2xl font-bold text-white m-0";
          title.textContent = text;

          header.appendChild(badge);
          header.appendChild(title);
          card.appendChild(header);

          const contentContainer = document.createElement("div");
          contentContainer.className = "p-6 space-y-6 max-h-[70vh] overflow-y-auto";
          card.appendChild(contentContainer);

          h.replaceWith(card);
          currentSubStrandCard = contentContainer;
        } else {
          currentSubStrandCard = h.parentElement.querySelector(":scope > div:last-child") as HTMLDivElement;
        }

        tocItems.push({ id, title: text, level: 2 });
        return;
      }

      // Section H3
      if (level === 3) {
        sectionCount += 1;
        const id = `section-${subStrandCount}-${sectionCount}-${slugify(text)}`;

        const sectionCard = document.createElement("div");
        sectionCard.className = "rounded-lg bg-white/5 border border-white/10 p-4";
        sectionCard.id = id;

        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2";

        const icon = getSectionIcon(text);
        if (icon) {
          const iconSpan = document.createElement("span");
          iconSpan.innerHTML = icon;
          sectionTitle.appendChild(iconSpan);
        }

        const titleText = document.createElement("span");
        titleText.textContent = text;
        sectionTitle.appendChild(titleText);

        sectionCard.appendChild(sectionTitle);

        const sectionContent = document.createElement("div");
        sectionContent.className = "space-y-2";
        sectionCard.appendChild(sectionContent);

        if (currentSubStrandCard) {
          currentSubStrandCard.appendChild(sectionCard);
        } else {
          h.replaceWith(sectionCard);
        }

        h.replaceWith(sectionCard);
        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // Subsection H4
      if (level === 4) {
        h.classList.add("text-base", "font-medium", "text-teal-300", "mt-3", "mb-2");
        return;
      }
    });

    // Style images
    container.querySelectorAll("img").forEach((img) => {
      img.classList.add("rounded-md", "mx-auto", "block", "max-w-full", "h-auto");
      const wrapper = document.createElement("figure");
      wrapper.className = "my-4";
      img.parentElement?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      if (img.getAttribute("alt") && !wrapper.querySelector("figcaption")) {
        const cap = document.createElement("figcaption");
        cap.className = "text-xs text-white/60 mt-2 text-center";
        cap.textContent = img.getAttribute("alt") || "";
        wrapper.appendChild(cap);
      }
    });

    // Style tables
    container.querySelectorAll("table").forEach((table) => {
      const scroll = document.createElement("div");
      scroll.className = "overflow-x-auto my-4";
      table.parentElement?.insertBefore(scroll, table);
      scroll.appendChild(table);

      table.classList.add("w-full", "text-left", "border-collapse");
      const thead = table.querySelector("thead");
      if (thead) thead.classList.add("bg-white/5");
      table.querySelectorAll("th").forEach((th) => th.classList.add("px-3", "py-2", "font-semibold", "text-white", "border-b", "border-white/10"));
      table.querySelectorAll("td").forEach((td) => td.classList.add("px-3", "py-2", "text-white/80", "border-b", "border-white/10"));
      Array.from(table.querySelectorAll("tbody tr")).forEach((tr, idx) => {
        if (idx % 2 === 1) tr.classList.add("bg-white/[0.03]");
      });
    });

    // Paragraphs & lists
    container.querySelectorAll("p").forEach((p) => p.classList.add("my-3", "leading-relaxed", "text-white/90"));
    container.querySelectorAll("ul").forEach((ul) => ul.classList.add("list-disc", "pl-6", "my-3", "space-y-2"));
    container.querySelectorAll("ol").forEach((ol) => ol.classList.add("list-decimal", "pl-6", "my-3", "space-y-2"));
    container.querySelectorAll("li").forEach((li) => li.classList.add("leading-relaxed"));

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [content]);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  function getSectionIcon(sectionName: string): string {
    const name = sectionName.toLowerCase();
    if (name.includes("learning outcomes") || name.includes("outcome")) return "🎯";
    if (name.includes("key concepts") || name.includes("concept")) return "💡";
    if (name.includes("explanation") || name.includes("content")) return "📖";
    if (name.includes("example")) return "✏️";
    if (name.includes("activity") || name.includes("exercise")) return "🎨";
    return "📌";
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 py-6">
      <div className="prose prose-invert max-w-none">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-white m-0">Lesson Content</h2>
        </div>

        {content && formattedHtml ? (
          <article className="prose prose-invert max-w-none text-white/90 prose-headings:text-white prose-a:text-blue-300 hover:prose-a:text-blue-200 prose-strong:text-white prose-code:text-blue-200">
            {toc.length > 0 && (
              <aside className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Contents</div>
                <nav>
                  <ul className="m-0 p-0 list-none space-y-1">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === 2 ? "pl-0" : item.level === 3 ? "pl-4" : "pl-8"}>
                        <a href={`#${item.id}`} className="text-white/80 hover:text-white transition-colors">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
          </article>
        ) : (
          <div className="text-white/80 leading-relaxed space-y-4 pl-5">
            <p className="text-base">
              This is your generated lesson content. Summaries, key points, and interactive elements will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
