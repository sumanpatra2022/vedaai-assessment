"use client";
import { useState} from "react";
import type { ReactNode } from "react";

import {
  Home as HomeIcon,
  BookOpen,
  ClipboardList,
  FileText,
  Library,
  Settings,
  Sparkles,
   Upload,
   GraduationCap,
} from "lucide-react";

type Question = {
  number: string;
  text: string;
  mark: string;
};

type Answer = {
  number: string;
  text: string;
};

type Evaluation = {
  obtainedMarks: number;
  maxMarks: number;
  status: "Correct" | "Partially Correct" | "Incorrect";
  reason: string;
};



export default function Home() {



const [questionFile, setQuestionFile] = useState<File | null>(null);
const [answerFile, setAnswerFile] = useState<File | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [showMapping, setShowMapping] = useState(false);
const [selectedQuestion, setSelectedQuestion] = useState(0);
const [questions, setQuestions] = useState<Question[]>([]);
const [answers, setAnswers] = useState<Answer[]>([]);

const [results, setResults] = useState<(boolean | null)[]>([]);
const [evaluations, setEvaluations] = useState<
  (Evaluation | null)[]
>([]);
const [questionText, setQuestionText] = useState("");
const [answerText, setAnswerText] = useState("");


function extractMark(text: string): string {
  const match = text.match(/\((\d+)\s*marks?\)/i);

  if (!match) {
    return "Marks";
  }

  return `${match[1]} Mark${match[1] === "1" ? "" : "s"}`;
}

function parseQuestions(text: string): Question[] {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const questions: Question[] = [];

  let currentQuestion: Question | null = null;

  for (const line of lines) {



    const questionMatch = line.match(
      /^(?:Q(?:uestion)?\s*)?(\d+)\s*[.)]?\s*(?:\(([a-zA-Z])\)\s*)?(.*)$/i
    );

    if (questionMatch) {
      const number = questionMatch[1];
      const subPart = questionMatch[2];
      const questionText = questionMatch[3].trim();

      // IMPORTANT:
      // Ignore things like "CLASS 10"
      if (
        line.toLowerCase().startsWith("class ") ||
        line.toLowerCase().startsWith("page ")
      ) {
        continue;
      }

      const questionNumber = subPart
        ? `${number}(${subPart.toLowerCase()})`
        : number;

      currentQuestion = {
        number: questionNumber,
        text: questionText,
        mark: extractMark(questionText),
      };

      questions.push(currentQuestion);

      continue;
    }

  

    const subPartMatch = line.match(
      /^\(([a-zA-Z])\)\s*(.*)$/i
    );

    if (subPartMatch && currentQuestion) {
const baseNumber: string =
  currentQuestion.number.split("(")[0];

const questionNumber: string =
  `${baseNumber}(${subPartMatch[1].toLowerCase()})`;

      const questionText = subPartMatch[2].trim();

      currentQuestion = {
        number: questionNumber,
        text: questionText,
        mark: extractMark(questionText),
      };

      questions.push(currentQuestion);

      continue;
    }

    // Continuation of the previous question
    if (currentQuestion) {
      currentQuestion.text += " " + line;
      currentQuestion.mark = extractMark(currentQuestion.text);
    }
  }

  return questions;
}

function parseAnswers(text: string): Answer[] {
  const regex =
    /(?:^|\n)\s*Q\s*(\d+)\s*(?:\(([a-zA-Z])\))?\s+([\s\S]*?)(?=\n\s*Q\s*\d+\s*(?:\([a-zA-Z]\))?\s+|$)/gi;

  const matches = [...text.matchAll(regex)];

  return matches.map((match) => ({
    number: match[2]
      ? `${match[1]}(${match[2].toLowerCase()})`
      : match[1],
    text: match[3].trim(),
  }));
}


  
const finalEvaluations = evaluations.map(
  (evaluation, index) => {
    const manualResult = results[index];

    // Teacher manually evaluated
    if (
      manualResult !== null &&
      manualResult !== undefined
    ) {
      return {
        obtainedMarks: manualResult
          ? evaluation?.maxMarks || 0
          : 0,
        maxMarks: evaluation?.maxMarks || 0,
        status: manualResult
          ? "Correct"
          : "Incorrect",
      };
    }

    // No teacher decision → use AI result
    return {
      obtainedMarks:
        evaluation?.obtainedMarks || 0,
      maxMarks:
        evaluation?.maxMarks || 0,
      status:
        evaluation?.status || "Not Evaluated",
    };
  }
);

const totalMarks = finalEvaluations.reduce(
  (total, evaluation) =>
    total + evaluation.maxMarks,
  0
);

const obtainedMarks = finalEvaluations.reduce(
  (total, evaluation) =>
    total + evaluation.obtainedMarks,
  0
);

const correctCount = finalEvaluations.filter(
  (evaluation) =>
    evaluation.status === "Correct"
).length;

const incorrectCount = finalEvaluations.filter(
  (evaluation) =>
    evaluation.status === "Incorrect"
).length;

const notEvaluatedCount = finalEvaluations.filter(
  (evaluation) =>
    evaluation.status === "Not Evaluated"
).length;

const percentage =
  totalMarks > 0
    ? ((obtainedMarks / totalMarks) * 100).toFixed(2)
    : "0.00";

    const currentQuestion =
  questions[selectedQuestion];

const currentAnswer =
  answers.find(
    (answer) => answer.number === currentQuestion?.number
  );


if (isProcessing) {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">

      <div className="text-center">

        <div className="relative w-20 h-20 mx-auto mb-6">

          <div className="absolute inset-0 rounded-full bg-orange-100 animate-pulse" />

          <div className="absolute inset-3 rounded-full bg-orange-200 flex items-center justify-center">
            <Sparkles
              size={32}
              className="text-orange-500"
            />
          </div>

        </div>

        <h1 className="text-xl font-semibold text-gray-900">
          Extracting...
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          This may take a while
        </p>

      </div>

    </main>
  );
}

if (showMapping) {
  return (
    <main className="min-h-screen bg-[#f7f7f7] flex">

      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen bg-white border-r border-gray-200 p-5 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold">
            V
          </div>

          <span className="font-semibold text-lg">
            VedaAI
          </span>
        </div>

        {/* AI Toolkit */}
        <button className="w-full rounded-full bg-black text-white py-2 px-3 text-sm flex items-center justify-center gap-2 mb-7">
          <Sparkles size={15} />
          AI Teacher's Toolkit
        </button>

        {/* Navigation */}
        <nav className="space-y-2">

          <NavItem
            icon={<HomeIcon size={16} />}
            text="Home"
          />

          <NavItem
            icon={<BookOpen size={16} />}
            text="My Classroom"
          />

          <NavItem
            icon={<ClipboardList size={16} />}
            text="Assignments"
          />

          <NavItem
            icon={<FileText size={16} />}
            text="Exams"
            active
          />

          <NavItem
            icon={<Library size={16} />}
            text="My Library"
          />

        </nav>

        <div className="mt-auto">

          <NavItem
            icon={<Settings size={16} />}
            text="Settings"
          />

          <div className="mt-5 bg-[#f5f5f5] rounded-xl p-3">

            <p className="text-xs font-semibold">
              Delhi Public School
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              Kolkata School
            </p>

          </div>

        </div>

      </aside>

      {/* Main */}
      <section className="flex-1">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">

          <div className="text-sm text-gray-400">
            Exams
          </div>

          <div className="flex items-center gap-4">

            <span className="text-sm">
              🔔
            </span>

            <span className="text-sm">
              👤
            </span>

            <span className="text-sm font-medium">
              Madhur Rastogi
            </span>

          </div>

        </header>

        {/* Mapping content */}
        <div className="p-8">

          {/* Heading */}
          <div className="mb-6">

            <h1 className="text-2xl font-semibold text-gray-900">
              Map Answers to Questions
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Review the extracted questions and student answers.
            </p>

          </div>

          {/* Main mapping area */}
          <div className="grid grid-cols-[220px_1fr] gap-6">

            {/* Question list */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">

              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                Questions
              </h2>

 <div className="space-y-2">
{questions.map((question, index) => (
    <button
      key={index}
      type="button"
      onClick={() => setSelectedQuestion(index)}
      className={`w-full text-left px-3 py-2 rounded-lg ${
        selectedQuestion === index
          ? "bg-gray-100 font-medium text-gray-900"
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      Question {question.number}
    </button>
  ))}
</div>

            </div>

            {/* Question + Answer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">

              <div className="flex items-center justify-between mb-5">

                <div>
<p className="text-xs text-gray-400">
  QUESTION {currentQuestion?.number}
</p>

                  <h2 className="text-lg font-semibold text-gray-900 mt-1">
  {currentQuestion.text}
</h2>

                </div>

                <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
  {currentQuestion.mark}
</span>

              </div>

              {/* Question */}
              <div className="bg-gray-50 rounded-lg p-4 mb-5">

                <div className="bg-gray-50 rounded-lg p-4 mb-5">
  <p className="text-sm text-gray-700 whitespace-pre-wrap">
    {currentQuestion?.text}
  </p>
</div>

              </div>

              {/* Student answer */}
              <div>

                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Student Answer
                </p>

                <div className="border border-gray-200 rounded-lg p-4">

                  <p className="text-sm text-gray-700">
{currentAnswer?.text || "No answer found for this question."}
</p>

                </div>

              </div>

              {/* AI Evaluation */}
{/* AI Evaluation */}
{evaluations[selectedQuestion] && (
  <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4">

    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-800">
        AI Evaluation
      </p>

      <span className="text-sm font-semibold text-orange-600">
        {evaluations[selectedQuestion]?.obtainedMarks} /{" "}
        {evaluations[selectedQuestion]?.maxMarks}
      </span>
    </div>

    <p
      className={`text-sm font-medium mt-2 ${
        evaluations[selectedQuestion]?.status === "Correct"
          ? "text-green-600"
          : evaluations[selectedQuestion]?.status ===
            "Partially Correct"
          ? "text-orange-600"
          : "text-red-600"
      }`}
    >
      {evaluations[selectedQuestion]?.status}
    </p>

    <p className="text-sm text-gray-600 mt-2">
      {evaluations[selectedQuestion]?.reason}
    </p>

    {/* Teacher Decision */}
    {results[selectedQuestion] !== null &&
      results[selectedQuestion] !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200">

          <p className="text-xs text-gray-500">
            Teacher Decision
          </p>

          <p
            className={`text-sm font-semibold mt-1 ${
              results[selectedQuestion]
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {results[selectedQuestion]
              ? "✓ Correct"
              : "✕ Incorrect"}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Final marks:{" "}
            {results[selectedQuestion]
              ? evaluations[selectedQuestion]?.maxMarks
              : 0}{" "}
            /{" "}
            {evaluations[selectedQuestion]?.maxMarks}
          </p>

        </div>
      )}

  </div>
)}

              {/* Evaluation */}
           
<div className="flex gap-3 mt-6">

<button
  type="button"
  onClick={() => {
    const updatedResults = [...results];

    updatedResults[selectedQuestion] = true;

    setResults(updatedResults);
  }}
  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
    results[selectedQuestion] === true
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
  }`}
>
  ✓ Correct
</button>

<button
  type="button"
  onClick={() => {
    const updatedResults = [...results];

    updatedResults[selectedQuestion] = false;

    setResults(updatedResults);
  }}
  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
    results[selectedQuestion] === false
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
  }`}
>
  ✕ Incorrect
</button>

  {/* <button
  type="button"
  onClick={async () => {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion?.text,
          expectedAnswer: currentAnswer?.text,
          studentAnswer: currentAnswer?.text,
          maxMarks: Number(
            currentQuestion?.mark.match(/\d+/)?.[0] || 1
          ),
        }),
      });

      const data = await response.json();

      console.log("EVALUATION RESULT:", data);

    } catch (error) {
      console.error("Evaluation error:", error);
    }
  }}
  className="mt-4 w-full py-3 rounded-lg bg-black text-white text-sm"
>
  Test AI Evaluation
</button> */}

</div>
<div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">

  <h3 className="text-lg font-semibold text-gray-900">
    Evaluation Summary
  </h3>

  <div className="mt-4 grid grid-cols-4 gap-3">

    <div className="bg-white rounded-lg p-3 border">
      <p className="text-xs text-gray-500">
        Score
      </p>

      <p className="text-xl font-semibold text-gray-900">
        {obtainedMarks} / {totalMarks}
      </p>
    </div>

    <div className="bg-white rounded-lg p-3 border">
      <p className="text-xs text-gray-500">
        Percentage
      </p>

      <p className="text-xl font-semibold text-gray-900">
        {percentage}%
      </p>
    </div>

    <div className="bg-white rounded-lg p-3 border">
      <p className="text-xs text-gray-500">
        Correct
      </p>

      <p className="text-xl font-semibold text-green-600">
        {correctCount}
      </p>
    </div>

    <div className="bg-white rounded-lg p-3 border">
      <p className="text-xs text-gray-500">
        Incorrect
      </p>

      <p className="text-xl font-semibold text-red-600">
        {incorrectCount}
      </p>
    </div>

  </div>

  {notEvaluatedCount > 0 && (
    <p className="text-xs text-gray-500 mt-3">
      {notEvaluatedCount} question(s) not evaluated yet.
    </p>
  )}

</div>


            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
  return (
    <main className="min-h-screen bg-[#f7f7f7] flex">

      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen bg-white border-r border-gray-200 p-5 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold">
            V
          </div>

          <span className="font-semibold text-lg">
            VedaAI
          </span>
        </div>

        {/* AI Teacher's Toolkit */}
        <button className="w-full rounded-full bg-black text-white py-2 px-3 text-sm flex items-center justify-center gap-2 mb-7">
          <Sparkles size={15} />
          AI Teacher's Toolkit
        </button>

        {/* Navigation */}
        <nav className="space-y-2">

          <NavItem icon={<HomeIcon size={16} />} text="Home" />

          <NavItem
            icon={<BookOpen size={16} />}
            text="My Classroom"
          />

          <NavItem
            icon={<ClipboardList size={16} />}
            text="Assignments"
          />

          <NavItem
            icon={<FileText size={16} />}
            text="Exams"
            active
          />

          <NavItem
            icon={<Library size={16} />}
            text="My Library"
          />

        </nav>

        {/* Bottom */}
        <div className="mt-auto">

          <NavItem
            icon={<Settings size={16} />}
            text="Settings"
          />

          {/* School */}
          <div className="mt-5 bg-[#f5f5f5] rounded-xl p-3">
            <p className="text-xs font-semibold">
              Delhi Public School
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              Kolkata School
            </p>
          </div>

        </div>

      </aside>

      {/* Main Content */}
      <section className="flex-1">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">

          <div className="text-sm text-gray-400">
            Exams
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">🔔</span>
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium">
              Madhur Rastogi
            </span>
          </div>

        </header>

        {/* Page content */}
        {/* Page content */}
<div className="min-h-[calc(100vh-56px)] flex flex-col items-center pt-16 px-8">

  {/* Heading */}
  <div className="text-center">
    <h1 className="text-2xl font-semibold text-gray-900">
      Upload{" "}
      <span className="text-orange-500">
        Question Paper & Answer Sheets
      </span>
    </h1>

    <p className="text-sm text-gray-500 mt-2">
      Upload both files to get started
    </p>
  </div>

  {/* Teacher illustration placeholder */}
  <div className="mt-8 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
    <div className="w-11 h-11 rounded-full bg-orange-200 flex items-center justify-center">
      <GraduationCap
        size={28}
        className="text-orange-500"
      />
    </div>
  </div>

{/* Upload Cards */}
<div className="mt-8 w-full max-w-[620px] grid grid-cols-2 gap-4">

  {/* Question Paper */}
  <label className="h-40 bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition">

    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
      <Upload size={20} className="text-gray-600" />
    </div>

    {questionFile ? (
      <>
        <p className="text-sm font-medium text-gray-800 text-center px-3 truncate max-w-full">
          {questionFile.name}
        </p>

        <p className="text-xs text-green-500 mt-1">
          File uploaded ✓
        </p>
      </>
    ) : (
      <>
        <p className="text-sm font-medium text-gray-800">
          Upload{" "}
          <span className="text-orange-500">
            Question Paper
          </span>
        </p>

        <p className="text-xs text-gray-400 mt-1">
          PDF 
        </p>
      </>
    )}

    <input
      type="file"
      accept=".pdf,image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (file) {
          setQuestionFile(file);
        }
      }}
    />

  </label>


  {/* Answer Sheet */}
  <label className="h-40 bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition">

    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
      <Upload size={20} className="text-gray-600" />
    </div>

    {answerFile ? (
      <>
        <p className="text-sm font-medium text-gray-800 text-center px-3 truncate max-w-full">
          {answerFile.name}
        </p>

        <p className="text-xs text-green-500 mt-1">
          File uploaded ✓
        </p>
      </>
    ) : (
      <>
        <p className="text-sm font-medium text-gray-800">
          Upload{" "}
          <span className="text-orange-500">
            Answer Sheet
          </span>
        </p>

        <p className="text-xs text-gray-400 mt-1">
          PDF 
        </p>
      </>
    )}

    <input
      type="file"
      accept=".pdf,image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (file) {
          setAnswerFile(file);
        }
      }}
    />

  </label>

</div>

  {/* Start Mapping */}
<button
  type="button"
  disabled={!questionFile || !answerFile}
onClick={async () => {
  if (!questionFile || !answerFile) {
    return;
  }

  setIsProcessing(true);

  try {
    const formData = new FormData();

    formData.append("questionFile", questionFile);
    formData.append("answerFile", answerFile);

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

const data = await response.json();

console.log("API RESPONSE:", data);

if (!response.ok) {
  throw new Error(data.error || "Extraction failed");
}
setQuestionText(data.questionText);
setAnswerText(data.answerText);

const parsedQuestions = parseQuestions(data.questionText);
const parsedAnswers = parseAnswers(data.answerText);

console.log("PARSED QUESTIONS:", parsedQuestions);
console.log("PARSED ANSWERS:", parsedAnswers);

setQuestions(parsedQuestions);
setAnswers(parsedAnswers);

setResults(
  Array(parsedQuestions.length).fill(null)
);

setEvaluations(
  Array(parsedQuestions.length).fill(null)
);

setSelectedQuestion(0);

// Automatically evaluate every question
const evaluationResults: (Evaluation | null)[] = [];

for (let i = 0; i < parsedQuestions.length; i++) {
  const question = parsedQuestions[i];

  const answer = parsedAnswers.find(
    (a) => a.number === question.number
  );

  const maxMarks =
    Number(question.mark.match(/\d+/)?.[0] || 1);

  try {
    const evaluationResponse = await fetch(
      "/api/evaluate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.text,

          expectedAnswer: "",

          studentAnswer:
            answer?.text || "",

          maxMarks,
        }),
      }
    );

    const evaluationData =
      await evaluationResponse.json();

    console.log(
      `EVALUATION QUESTION ${question.number}:`,
      evaluationData
    );

    if (!evaluationResponse.ok) {
      throw new Error(
        evaluationData.error ||
        "Evaluation failed"
      );
    }

    evaluationResults.push({
      obtainedMarks:
        Number(evaluationData.obtainedMarks) || 0,

      maxMarks:
        Number(evaluationData.maxMarks) || maxMarks,

      status:
        evaluationData.status,

      reason:
        evaluationData.reason || "",
    });

  } catch (error) {
    console.error(
      `Evaluation failed for Question ${question.number}:`,
      error
    );

    evaluationResults.push({
      obtainedMarks: 0,
      maxMarks,
      status: "Incorrect",
      reason: "Evaluation could not be completed.",
    });
  }
}

setEvaluations(evaluationResults);

setIsProcessing(false);
setShowMapping(true);

  } catch (error) {
    console.error("Extraction error:", error);
    setIsProcessing(false);
  }
}}
  className={`mt-8 px-7 py-3 rounded-full text-sm font-medium transition ${
    questionFile && answerFile
      ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
      : "bg-gray-200 text-gray-400 cursor-not-allowed"
  }`}
>
  Start Mapping →
</button>

  <p className="text-xs text-gray-400 mt-3">
    Once both files are uploaded, you'll be able to map answers with questions.
  </p>

</div>

      </section>

    </main>
  );
}


/* Navigation item */

function NavItem({
  icon,
  text,
  active = false,
}: {
  icon: ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer
        ${
          active
            ? "bg-gray-100 text-black"
            : "text-gray-500 hover:bg-gray-50"
        }
      `}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}