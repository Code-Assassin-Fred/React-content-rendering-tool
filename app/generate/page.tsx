"use client";
import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/TextbookRenderer";
import contentJson from "@/content.json";

// ---- Types ----
interface SubStrand {
  Outcomes: string[];
}

interface Strand {
  SubStrands: Record<string, SubStrand>;
}

interface Subject {
  Strands: Record<string, Strand>;
}

interface GradeMap {
  [grade: string]: {
    [subject: string]: Subject;
  };
}

// ---- Component ----
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

  // ---- Update subjects when grade changes ----
  useEffect(() => {
    if (!selectedGrade) return;
    const subjectsList = Object.keys(
      (contentJson as GradeMap)[selectedGrade] || {}
    );
    setSubjects(subjectsList);
    setSelectedSubject(subjectsList[0] || "");
  }, [selectedGrade]);

  // ---- Update strands when subject changes ----
  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    const strandsObj =
      (contentJson as GradeMap)[selectedGrade][selectedSubject].Strands;
    const strandsList = Object.keys(strandsObj || {});
    setStrands(strandsList);
    setSelectedStrand(strandsList[0] || "");
  }, [selectedGrade, selectedSubject]);

  // ---- Generate strand ----
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
          strand: selectedStrand,
        }),
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

  // ---- Render ----
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Toolbar Card */}
      <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Dropdowns */}
        <div className="flex gap-4 flex-wrap flex-1">
          {/* Grade */}
          <div className="flex flex-col flex-1 min-w-[100px]">
            <label className="font-semibold mb-1">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="flex flex-col flex-1 min-w-[120px]">
            <label className="font-semibold mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Strand */}
          <div className="flex flex-col flex-1 min-w-[140px]">
            <label className="font-semibold mb-1">Strand</label>
            <select
              value={selectedStrand}
              onChange={(e) => setSelectedStrand(e.target.value)}
              className="border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            >
              {strands.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={generateStrand}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Strand"}
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      {(learnerHtml || teacherHtml) && (
        <div className="flex gap-4 mt-2">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              mode === "Learner"
                ? "bg-blue-600 text-white shadow"
                : "border border-gray-300 bg-white"
            }`}
            onClick={() => setMode("Learner")}
          >
            Learner's Book
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              mode === "Teacher"
                ? "bg-blue-600 text-white shadow"
                : "border border-gray-300 bg-white"
            }`}
            onClick={() => setMode("Teacher")}
          >
            Teacher's Guide
          </button>
        </div>
      )}

      {/* Rendered Content */}
      <div className="bg-white shadow rounded-lg p-6 overflow-auto max-h-[75vh]">
        <TextbookRenderer
          content={mode === "Learner" ? learnerHtml : teacherHtml}
        />
      </div>
    </div>
  );
}
