import sanitizeHtml from "sanitize-html";

export const sanitize = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4",
      "section", "div",
      "p",
      "ul", "ol", "li",
      "b", "strong", "i", "em",
      "table", "thead", "tbody", "tr", "th", "td",
      "img", "blockquote"
    ],

    allowedAttributes: {
      div: ["class"],
      section: ["class"],
      h1: ["class"], h2: ["class"], h3: ["class"], h4: ["class"],
      p: ["class"],
      ul: ["class"], ol: ["class"],
      img: ["src", "alt", "class"],
      table: ["class"], th: ["class"], td: ["class"], blockquote: ["class"]
    },

    allowedSchemes: ["http", "https", "data"],
    disallowedTagsMode: "discard",
  });
