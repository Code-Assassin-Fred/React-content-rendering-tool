"use client";
import { useState } from "react";
import TextbookRenderer from "@/components/TextbookRenderer";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");

  const generate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setHtml(data.html);
  };

  return (
    <div className="p-6 flex gap-6">
      <div className="w-1/3 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-64 p-3 border rounded"
          placeholder="Enter prompt"
        />

        <button
          onClick={generate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Generate
        </button>
      </div>

      <div className="w-2/3 border rounded p-4 overflow-auto h-screen">
        <TextbookRenderer content={html} />
      </div>
    </div>
  );
}
