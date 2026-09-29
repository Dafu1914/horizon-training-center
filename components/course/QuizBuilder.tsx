"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Question = {
  _id?: string;
  type: "multiple" | "boolean" | "short";
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

type Props = {
  initialQuestions?: Question[];
  passingScore?: number;
  onChange: (questions: Question[], passingScore: number) => void;
};

export default function QuizBuilder({
  initialQuestions = [],
  passingScore: initialPassing = 70,
  onChange,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [passingScore, setPassingScore] = useState(initialPassing);

  const update = (newQ: Question[], newPass?: number) => {
    setQuestions(newQ);
    const pass = newPass !== undefined ? newPass : passingScore;
    onChange(newQ, pass);
  };

  const addQuestion = (type: Question["type"]) => {
    const newQ: Question = {
      type,
      question: "",
      options: type === "multiple" ? ["", "", "", ""] : type === "boolean" ? ["True", "False"] : [],
      correctAnswer: type === "boolean" ? "True" : "",
      points: 1,
    };
    update([...questions, newQ]);
  };

  const updateQuestion = (idx: number, patch: Partial<Question>) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], ...patch };
    update(copy);
  };

  const removeQuestion = (idx: number) => {
    update(questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    update(copy);
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
            {totalPoints} point{totalPoints !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-500">
            Passing score: {passingScore}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Pass:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={passingScore}
            onChange={(e) => {
              const v = Number(e.target.value);
              setPassingScore(v);
              update(questions, v);
            }}
            className="w-16 border rounded px-2 py-1 text-sm"
          />
          <span className="text-xs text-gray-600">%</span>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div
          key={idx}
          className="bg-gray-50 border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-blue-800">
              Q{idx + 1} — {q.type === "multiple" ? "Multiple Choice" : q.type === "boolean" ? "True/False" : "Short Answer"}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveQuestion(idx, -1)}
                disabled={idx === 0}
                className="text-xs px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(idx, 1)}
                disabled={idx === questions.length - 1}
                className="text-xs px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                className="text-xs px-2 py-1 rounded hover:bg-red-100 text-red-700"
              >
                ✕
              </button>
            </div>
          </div>

          <textarea
            rows={2}
            value={q.question}
            onChange={(e) => updateQuestion(idx, { question: e.target.value })}
            placeholder="Enter question..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {/* Multiple choice options */}
          {q.type === "multiple" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">
                Options (select correct one):
              </p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q${idx}-correct`}
                    checked={q.correctAnswer === opt && opt !== ""}
                    onChange={() => updateQuestion(idx, { correctAnswer: opt })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-mono w-6">
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const opts = [...q.options];
                      opts[oi] = e.target.value;
                      updateQuestion(idx, { options: opts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
              <div className="text-xs text-gray-500">
                ✓ Correct: <strong>{q.correctAnswer || "(not set)"}</strong>
              </div>
            </div>
          )}

          {/* True/False */}
          {q.type === "boolean" && (
            <div className="flex gap-2">
              {["True", "False"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateQuestion(idx, { correctAnswer: val })}
                  className={`text-sm px-4 py-2 rounded-lg border-2 font-medium transition ${
                    q.correctAnswer === val
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {val === "True" ? "✓ True" : "✗ False"}
                </button>
              ))}
            </div>
          )}

          {/* Short answer */}
          {q.type === "short" && (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Correct Answer (exact text — case-insensitive):
              </label>
              <input
                type="text"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                placeholder="e.g., variable"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
              />
            </div>
          )}

          {/* Points */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Points:</label>
            <input
              type="number"
              min="1"
              value={q.points}
              onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
              className="w-16 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      ))}

      {/* Add buttons */}
      <div className="flex gap-2 flex-wrap pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("multiple")}
        >
          + Multiple Choice
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("boolean")}
        >
          + True/False
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("short")}
        >
          + Short Answer
        </Button>
      </div>
    </div>
  );
}