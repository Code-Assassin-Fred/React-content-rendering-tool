// app/generate/page.tsx
"use client";
import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/TextbookRenderer";

// Load the content.json dynamically
import contentJson from "../content.json";

interface GradeMap {
  [grade: string]: {
    [subject: string]: {
      SubStrands: Record<string, any>;
    };
  };
}

export default function GeneratePage() {
  const grades = Object.keys(contentJson);

  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>("");

  const [learnerHtml, setLearnerHtml] = useState<string>("");
  const [teacherHtml, setTeacherHtml] = useState<string>("");
  const [mode, setMode] = useState<"Learner" | "Teacher">("Learner");
  const [loading, setLoading] = useState(false);

  // Update subjects when grade changes
  useEffect(() => {
    if (!selectedGrade) return;
    const subjectsList = Object.keys((contentJson as GradeMap)[selectedGrade] || {});
    setSubjects(subjectsList);
    setSelectedSubject(subjectsList[0] || "");
  }, [selectedGrade]);

  // Update strands when subject changes
  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    const strandsObj = (contentJson as GradeMap)[selectedGrade][selectedSubject];
    const strandsList = Object.keys(strandsObj || {});
    setStrands(strandsList);
    setSelectedStrand(strandsList[0] || "");
  }, [selectedGrade, selectedSubject]);

  const generateStrand = async () => {
    if (!selectedGrade || !selectedSubject || !selectedStrand) return;
    setLoading(true);
    setLearnerHtml("");
    setTeacherHtml("");

    try {
      const res = await fetch("/api/generate-strand", {
        method: "POST",
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject,
          strand: selectedStrand
        })
      });
      const data = await res.json();

      setLearnerHtml(data.student_html || "");
      setTeacherHtml(data.teacher_html || "");
      setMode("Learner");
    } catch (err) {
      console.error(err);
      alert("Error generating strand. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Dropdowns */}
        <div className="flex gap-4 flex-wrap">
          {/* Grade */}
          <div>
            <label className="block mb-1 font-semibold">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border rounded p-2"
            >
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-1 font-semibold">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border rounded p-2"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Strand */}
          <div>
            <label className="block mb-1 font-semibold">Strand</label>
            <select
              value={selectedStrand}
              onChange={(e) => setSelectedStrand(e.target.value)}
              className="border rounded p-2"
            >
              {strands.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate button */}
        <div className="self-end">
          <button
            onClick={generateStrand}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Strand"}
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      {(learnerHtml || teacherHtml) && (
        <div className="flex gap-4">
          <button
            className={`px-3 py-1 rounded ${mode === "Learner" ? "bg-blue-600 text-white" : "border"}`}
            onClick={() => setMode("Learner")}
          >
            Learner's Book
          </button>
          <button
            className={`px-3 py-1 rounded ${mode === "Teacher" ? "bg-blue-600 text-white" : "border"}`}
            onClick={() => setMode("Teacher")}
          >
            Teacher's Guide
          </button>
        </div>
      )}

      {/* Render HTML */}
      <div className="border rounded p-4 overflow-auto h-[70vh]">
        <TextbookRenderer content={mode === "Learner" ? learnerHtml : teacherHtml} />
      </div>
    </div>
  );
}
