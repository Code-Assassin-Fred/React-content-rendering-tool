import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content:
          "Return ONLY HTML. No markdown. No explanations. Use clean HTML structure.",
      },
      { role: "user", content: prompt },
    ],
  });

  const html = completion.choices[0].message.content || "";

  return NextResponse.json({ html });
}
