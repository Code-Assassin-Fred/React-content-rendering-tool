export function detectHeading(line: string): { level: number; text: string } | null {
  const trimmed = line.trim();

  if (/^#{1,3}\s+/.test(trimmed)) {
    const level = trimmed.match(/^#+/)![0].length;
    return { level, text: trimmed.replace(/^#{1,3}\s+/, "").trim() };
  }

  if (trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
    return { level: 1, text: trimmed };
  }

  if (/^[A-Z][A-Za-z ]{3,}$/.test(trimmed) && !trimmed.endsWith(".")) {
    return { level: 2, text: trimmed };
  }

  return null;
}
