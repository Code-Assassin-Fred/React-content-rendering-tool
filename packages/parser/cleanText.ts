export function cleanText(text: string): string {
  let out = text;

  out = out.replace(/\*\*/g, "");
  out = out.replace(/__/g, "");
  out = out.replace(/_/g, "");

  out = out.replace(/\r/g, "");
  out = out.replace(/\t/g, " ");

  out = out.replace(/\n{3,}/g, "\n\n");

  out = out.replace(/[•●▪︎◦]/g, "-");

  out = out.replace(/^\s*-\s+/gm, "- ");
  out = out.replace(/^\s*\*\s+/gm, "- ");

  out = out.trim();

  return out;
}
