"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import QuizBuilder from "./QuizBuilder";

type Props = {
  chapterId: string;
  courseId: string;
  editingLesson: any | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function LessonForm({
  chapterId,
  courseId,
  editingLesson,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState(editingLesson?.title || "");
  const [videoSource, setVideoSource] = useState<
    "none" | "youtube" | "vimeo" | "upload"
  >(editingLesson?.videoType || "none");
  const [videoUrl, setVideoUrl] = useState(editingLesson?.videoUrl || "");
  const [textContent, setTextContent] = useState(
    editingLesson?.textContent || ""
  );
  const [durationMinutes, setDurationMinutes] = useState(
    editingLesson?.durationMinutes || 0
  );
  const [isFinalExam, setIsFinalExam] = useState(
    editingLesson?.isFinalExam || false
  );

  // Quiz state
  const [hasQuiz, setHasQuiz] = useState(editingLesson?.hasQuiz || false);
  const [questions, setQuestions] = useState<any[]>(
    editingLesson?.questions || []
  );
  const [passingScore, setPassingScore] = useState(
    editingLesson?.passingScore || 70
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState(
    editingLesson?.videoType === "upload" ? editingLesson.videoUrl : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      setError("File too large (max 500 MB)");
      return;
    }

    setUploading(true);
    setUploadProgress(
      `Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB...`
    );
    setError("");

    const formData = new FormData();
    formData.append("video", file);

    try {
      const token = localStorage.getItem("horizon_token");
      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        setUploadProgress("");
        return;
      }

      setUploadedUrl(data.url);
      setUploadProgress("Upload complete!");
      setTimeout(() => setUploadProgress(""), 2000);
    } catch {
      setError("Upload error");
      setUploadProgress("");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title required");
      return;
    }

    if (videoSource === "upload" && !uploadedUrl) {
      setError("Please upload a video");
      return;
    }
    if ((videoSource === "youtube" || videoSource === "vimeo") && !videoUrl) {
      setError("Video URL required");
      return;
    }

    // Quiz validation
    if (hasQuiz && questions.length === 0) {
      setError("Please add at least one quiz question, or uncheck the quiz.");
      return;
    }

    setSaving(true);

    const finalVideoUrl = videoSource === "upload" ? uploadedUrl : videoUrl;

    const body = {
      lessonId: editingLesson?._id,
      chapterId,
      courseId,
      title: title.trim(),
      videoType: videoSource,
      videoUrl: finalVideoUrl,
      textContent,
      durationMinutes,
      isFinalExam,
      isPublished: true,
      hasQuiz,
      questions,
      passingScore,
    };

    try {
      const token = localStorage.getItem("horizon_token");
      const res = await fetch("/api/lessons", {
        method: editingLesson ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold">
            {editingLesson ? "Edit Lesson" : "Add Lesson"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* ====== TITLE ====== */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Welcome to the course"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* ====== VIDEO SOURCE ====== */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🎥 Video Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "none", label: "📄 No video" },
                { key: "youtube", label: "▶️ YouTube" },
                { key: "vimeo", label: "🎬 Vimeo" },
                { key: "upload", label: "📤 Upload MP4" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setVideoSource(opt.key as typeof videoSource)
                  }
                  className={`text-sm px-3 py-2 rounded-lg border-2 font-medium transition ${
                    videoSource === opt.key
                      ? "border-blue-800 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube / Vimeo URL */}
          {(videoSource === "youtube" || videoSource === "vimeo") && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Video URL *
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={
                  videoSource === "youtube"
                    ? "https://youtube.com/watch?v=..."
                    : "https://vimeo.com/..."
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* Upload */}
          {videoSource === "upload" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Video File * (max 500 MB)
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={uploading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-800 file:text-white file:text-sm file:font-semibold hover:file:bg-blue-900"
              />
              {uploadProgress && (
                <p className="text-xs text-blue-700 mt-1">{uploadProgress}</p>
              )}
              {uploadedUrl && !uploadProgress && (
                <p className="text-xs text-emerald-700 mt-1">
                  ✓ Uploaded: {uploadedUrl.split("/").pop()}
                </p>
              )}
            </div>
          )}

          {/* ====== TEXT CONTENT ====== */}
          <div>
            <label className="block text-sm font-medium mb-1">
              📝 Text Content / Notes (optional)
            </label>
            <textarea
              rows={4}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Add lesson notes, summary, or additional reading..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* ====== QUIZ SECTION ====== */}
          <div className="border-t pt-5">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={hasQuiz}
                onChange={(e) => setHasQuiz(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">
                📝 Add a quiz to this lesson
              </span>
            </label>

            {hasQuiz && (
              <QuizBuilder
                initialQuestions={questions}
                passingScore={passingScore}
                onChange={(q, p) => {
                  setQuestions(q);
                  setPassingScore(p);
                }}
              />
            )}
          </div>

          {/* ====== DURATION + FINAL EXAM ====== */}
          <div className="grid md:grid-cols-2 gap-4 border-t pt-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFinalExam}
                  onChange={(e) => setIsFinalExam(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  🎓 Mark as Final Exam
                </span>
              </label>
            </div>
          </div>

          {/* ====== ACTIONS ====== */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              variant="emerald"
              className="flex-1"
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : "Save Lesson"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}