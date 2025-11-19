export function normalizeLists(lines: string[]): string[] {
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*]\s+/.test(trimmed)) {
      out.push(`- ${trimmed.replace(/^[-*]\s+/, "")}`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      out.push(trimmed);
      continue;
    }

    out.push(line);
  }

  return out;
}
