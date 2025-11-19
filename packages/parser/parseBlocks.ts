import { Block, ParseOptions } from "./types";
import { detectHeading } from "./detectHeadings";
import { normalizeLists } from "./normalizeLists";

export function parseBlocks(text: string, opts: ParseOptions = {}): Block[] {
  const lines = normalizeLists(text.split("\n"));
  const blocks: Block[] = [];

  let buffer: string[] = [];
  let listBuffer: string[] = [];
  let numberBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) blocks.push({ type: "paragraph", text: buffer.join(" ").trim() });
    buffer = [];
  };

  const flushBulletList = () => {
    if (listBuffer.length) blocks.push({ type: "bullet_list", items: [...listBuffer] });
    listBuffer = [];
  };

  const flushNumberList = () => {
    if (numberBuffer.length) blocks.push({ type: "number_list", items: [...numberBuffer] });
    numberBuffer = [];
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBulletList();
      flushNumberList();
      continue;
    }

    if (opts.detectHeadings) {
      const h = detectHeading(line);
      if (h) {
        flushParagraph();
        flushBulletList();
        flushNumberList();
        blocks.push({ type: "heading", level: h.level, text: h.text });
        continue;
      }
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      flushNumberList();
      listBuffer.push(line.replace(/^- /, "").trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushBulletList();
      numberBuffer.push(line.replace(/^\d+\.\s+/, "").trim());
      continue;
    }

    if (line.startsWith("[IMAGE DESCRIPTION")) {
      flushParagraph();
      flushBulletList();
      flushNumberList();
      blocks.push({ type: "image_description", text: line });
      continue;
    }

    if (line.startsWith("EXAMPLE:")) {
      flushParagraph();
      flushBulletList();
      flushNumberList();
      blocks.push({ type: "example", text: line.replace("EXAMPLE:", "").trim() });
      continue;
    }

    if (line.startsWith("NOTE:")) {
      flushParagraph();
      flushBulletList();
      flushNumberList();
      blocks.push({ type: "note", text: line.replace("NOTE:", "").trim() });
      continue;
    }

    buffer.push(line);
  }

  flushParagraph();
  flushBulletList();
  flushNumberList();

  return blocks;
}
