"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Question = {
  _id: string;
  type: "multiple" | "boolean" | "short";
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

type Props = {
  lessonId: string;
  lessonTitle: string;
  questions: Question[];
  passingScore: number;
  onClose: () => void;
  onPassed: () => void;
};

type Result = {
  score: number;
  passed: boolean;
  passingScore: number;
  earnedPoints: number;
  totalPoints: number;
  graded: any[];
};

export default function QuizModal({
  lessonId,
  lessonTitle,
  questions,
  passingScore,
  onClose,
  onPassed,
}: Props) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill("")
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const setAnswer = (idx: number, value: string) => {
    const copy = [...answers];
    copy[idx] = value;
    setAnswers(copy);
  };

  const allAnswered = answers.every((a) => a.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("horizon_token");
      const res = await fetch("/api/learn/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId, answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit quiz");
        setSubmitting(false);
        return;
      }

      setResult(data);

      if (data.passed) {
        onPassed();
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers(new Array(questions.length).fill(""));
    setError("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={result ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold">📝 Quiz</h2>
            <p className="text-xs text-gray-500">{lessonTitle}</p>
          </div>
          {!result && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* RESULT VIEW */}
        {result ? (
          <div className="p-6">
            {/* Score circle */}
            <div className="text-center py-6">
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
                  result.passed
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div>
                  <p
                    className={`text-4xl font-bold ${
                      result.passed ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {result.score}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.earnedPoints}/{result.totalPoints} pts
                  </p>
                </div>
              </div>

              <h3
                className={`text-2xl font-bold mt-4 ${
                  result.passed ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.passed ? "🎉 You Passed!" : "❌ Try Again"}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Passing score: {result.passingScore}%
              </p>
            </div>

            {/* Answer breakdown */}
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              <p className="font-semibold text-sm">Answer Breakdown:</p>
              {result.graded.map((g, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${
                    g.isCorrect
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg flex-shrink-0">
                      {g.isCorrect ? "✅" : "❌"}
                    </span>
                    <p className="font-medium text-sm">
                      Q{i + 1}: {g.question}
                    </p>
                  </div>
                  <div className="ml-7 space-y-1 text-xs">
                    <p className="text-gray-700">
                      <strong>Your answer:</strong>{" "}
                      <span
                        className={
                          g.isCorrect ? "text-emerald-700" : "text-red-700"
                        }
                      >
                        {g.studentAnswer}
                      </span>
                    </p>
                    {!g.isCorrect && (
                      <p className="text-gray-700">
                        <strong>Correct answer:</strong>{" "}
                        <span className="text-emerald-700">
                          {g.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              {result.passed ? (
                <Button
                  variant="emerald"
                  className="flex-1"
                  onClick={onClose}
                >
                  ✓ Continue to Next Lesson
                </Button>
              ) : (
                <>
                  <Button
                    variant="emerald"
                    className="flex-1"
                    onClick={handleRetry}
                  >
                    🔁 Try Again
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* QUESTIONS VIEW */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-600">
              Answer all {questions.length} questions. Passing score:{" "}
              <strong>{passingScore}%</strong>
            </p>

            {questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="bg-gray-50 border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold uppercase text-blue-800 bg-blue-100 px-2 py-1 rounded flex-shrink-0">
                    Q{idx + 1}
                  </span>
                  <p className="font-medium text-sm">{q.question}</p>
                </div>

                {/* Multiple choice */}
                {q.type === "multiple" && (
                  <div className="space-y-2 ml-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                          answers[idx] === opt
                            ? "border-blue-800 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          onChange={(e) => setAnswer(idx, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          <strong className="mr-2">
                            {String.fromCharCode(65 + oi)}.
                          </strong>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {q.type === "boolean" && (
                  <div className="flex gap-3 ml-2">
                    {["True", "False"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAnswer(idx, val)}
                        className={`flex-1 text-sm px-4 py-3 rounded-lg border-2 font-medium transition ${
                          answers[idx] === val
                            ? "border-blue-800 bg-blue-50 text-blue-900"
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
                  <input
                    type="text"
                    value={answers[idx]}
                    onChange={(e) => setAnswer(idx, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full ml-2 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                variant="emerald"
                className="flex-1"
                disabled={submitting || !allAnswered}
              >
                {submitting ? "Grading..." : "Submit Quiz"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}