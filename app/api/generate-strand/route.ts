// app/api/generate-strand/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Grade intensity mapping (like in your inspiration)
const GRADE_INTENSITY: Record<string, string> = {
  "4": "simple, clear, age-appropriate, short sentences",
  "5": "simple, clear, age-appropriate, short sentences",
  "6": "medium, longer sentences, slightly advanced vocabulary",
  "7": "medium, longer sentences, slightly advanced vocabulary",
  "8": "advanced intermediate, multi-step reasoning",
  "9": "advanced intermediate, multi-step reasoning",
  "10": "advanced academic, precise terminology, abstract reasoning",
  "11": "advanced academic, precise terminology, abstract reasoning",
  "12": "advanced academic, precise terminology, abstract reasoning"
};

// Helper to load JSON content
const loadContentJson = () => {
  const filePath = path.join(process.cwd(), "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

// Prompt generators
const studentPrompt = (
  grade: string,
  subject: string,
  strand: string,
  substrand: string,
  outcomes: string[]
) => {
  const intensity = GRADE_INTENSITY[grade] || "simple, clear language";
  const outcomesText = outcomes.join(", ");
  return `You are a senior Kenyan curriculum developer writing the official Grade ${grade} ${subject} Learner's Book.
Use language appropriate for Grade ${grade}: ${intensity}.
Explain all concepts fully. Show relationships between ideas: cause-effect, comparison, sequence, classification. Include Kenyan and global examples.
Begin directly with the content, no stories or questions.

Strand: ${strand}
Sub-Strand: ${substrand}
Strand Learning Outcomes: ${outcomesText}

Begin writing now. Return only clean HTML.`;
};

const teacherPrompt = (
  grade: string,
  subject: string,
  strand: string,
  substrand: string,
  outcomes: string[]
) => {
  const intensity = GRADE_INTENSITY[grade] || "simple, clear language";
  const outcomesText = outcomes.join(", ");
  return `You are a KICD National Trainer writing the official Teacher's Guide for Grade ${grade} ${subject}.
Use language appropriate for Grade ${grade}: ${intensity}.
Explain all concepts with depth, including conceptual relationships, real-world examples, and global connections.
Use headings: Lesson Objectives, Specific Learning Outcomes, Suggested Prior Knowledge, Key Concepts and Concept Development, Teaching and Learning Experiences, Differentiation and Support for Diverse Needs, Assessment for Learning, Common Learner Errors and Misconceptions, Cross-Curricular Links, Real-Life and Community Connections.

Strand: ${strand}
Sub-Strand: ${substrand}
Strand Learning Outcomes: ${outcomesText}

Start with Lesson Objectives. Return only clean HTML.`;
};

// Helper to call OpenAI
const callOpenAI = async (prompt: string) => {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are an expert educational content writer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.35,
    max_tokens: 6000
  });
  return completion.choices[0]?.message?.content || "";
};

// API handler
export async function POST(req: Request) {
  try {
    const { grade, subject, strand } = await req.json();

    if (!grade || !subject || !strand) {
      return NextResponse.json({ error: "Missing grade, subject, or strand" }, { status: 400 });
    }

    const curriculum = loadContentJson();

    if (!curriculum[grade] || !curriculum[grade][subject]) {
      return NextResponse.json({ error: "Invalid grade or subject" }, { status: 400 });
    }

    const strands = curriculum[grade][subject];
    const selectedStrand = strands[strand];

    if (!selectedStrand) {
      return NextResponse.json({ error: "Strand not found" }, { status: 404 });
    }

    const subStrands = selectedStrand.SubStrands || selectedStrand.SubStrands || selectedStrand;

    const studentHtmlArray: string[] = [];
    const teacherHtmlArray: string[] = [];

    // Iterate sub-strands → ONE API call per sub-strand
    for (const [subName, details] of Object.entries<any>(subStrands)) {
      const outcomes = details.Outcomes || [];
      // Learner
      const studentPromptText = studentPrompt(grade, subject, strand, subName, outcomes);
      const studentHtml = await callOpenAI(studentPromptText);
      studentHtmlArray.push(`<h2>${subName}</h2>${studentHtml}`);

      // Teacher
      const teacherPromptText = teacherPrompt(grade, subject, strand, subName, outcomes);
      const teacherHtml = await callOpenAI(teacherPromptText);
      teacherHtmlArray.push(`<h2>${subName}</h2>${teacherHtml}`);
    }

    const student_html = studentHtmlArray.join("\n");
    const teacher_html = teacherHtmlArray.join("\n");

    return NextResponse.json({
      grade,
      subject,
      strand,
      student_html,
      teacher_html
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
