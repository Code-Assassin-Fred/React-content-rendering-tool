import sanitizeHtml from "sanitize-html";

export const sanitize = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    disallowedTagsMode: "discard",
    transformTags: {
      "*": (tagName, attribs) => ({
        tagName,
        attribs,
      }),
    },
  });
