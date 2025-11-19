"use client";
import { useState } from "react";
import TextbookRenderer from "@/components/TextbookRenderer";

export default function PreviewPage() {
  const [html, setHtml] = useState("");

  return (
    <div className="p-6 flex gap-4">
      <textarea
        className="w-1/3 h-screen p-3 border rounded"
        placeholder="Paste raw HTML"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
      />

      <div className="w-2/3 border rounded p-4 overflow-auto h-screen">
        <TextbookRenderer content={html} />
      </div>
    </div>
  );
}
