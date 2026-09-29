"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import LessonForm from "@/components/course/LessonForm";

type Chapter = {
  _id: string;
  title: string;
  description: string;
  order: number;
};

type Lesson = {
  _id: string;
  chapter: string;
  title: string;
  order: number;
  videoUrl: string;
  videoType: string;
  hasQuiz: boolean;
  isFinalExam: boolean;
};

type Course = {
  _id: string;
  title: string;
};

export default function ChaptersBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");
  const [editingChapter, setEditingChapter] = useState<string | null>(null);

  const [lessonModalChapter, setLessonModalChapter] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = () => localStorage.getItem("horizon_token");

  const loadAll = () => {
    const t = token();
    if (!t) return;
    const headers = { Authorization: `Bearer ${t}` };

    Promise.allSettled([
      fetch(`/api/courses/${courseId}`, { headers }).then((r) => r.json()),
      fetch(`/api/chapters?course=${courseId}`, { headers }).then((r) => r.json()),
      fetch(`/api/lessons?course=${courseId}`, { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [c, ch, ls] = results;
      if (c.status === "fulfilled") setCourse(c.value.course || null);
      if (ch.status === "fulfilled") setChapters(ch.value.chapters || []);
      if (ls.status === "fulfilled") setLessons(ls.value.lessons || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    if (!stored) {
      window.location.href = "/login";
      return;
    }
    const u = JSON.parse(stored);
    if (u.role !== "teacher" && u.role !== "admin") {
      window.location.href = "/student";
      return;
    }
    setUser(u);
    loadAll();
  }, [courseId]);

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const t = token();
    if (!t) return;

    try {
      const url = "/api/chapters";
      const method = editingChapter ? "PATCH" : "POST";
      const body = editingChapter
        ? { chapterId: editingChapter, title: chapterTitle, description: chapterDesc }
        : { courseId, title: chapterTitle, description: chapterDesc };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }

      setSuccess(editingChapter ? "Chapter updated!" : "Chapter created!");
      setChapterTitle("");
      setChapterDesc("");
      setEditingChapter(null);
      setShowChapterForm(false);
      loadAll();
    } catch {
      setError("Network error");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter and all its lessons?")) return;
    const t = token();
    if (!t) return;
    await fetch(`/api/chapters?id=${chapterId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${t}` },
    });
    loadAll();
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter._id);
    setChapterTitle(chapter.title);
    setChapterDesc(chapter.description);
    setShowChapterForm(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    const t = token();
    if (!t) return;
    await fetch(`/api/lessons?id=${lessonId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${t}` },
    });
    loadAll();
  };

  if (loading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={course?.title || "Course Builder"}
        subtitle="Manage chapters and lessons"
        homeHref="/teacher"
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="text-blue-800 hover:underline text-sm"
        >
          ← Back to Course
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold mb-1">📚 Course Content</h1>
          <p className="text-gray-600">
            Building: <span className="font-medium">{course?.title}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {!showChapterForm && (
          <Button
            variant="emerald"
            className="mb-6"
            onClick={() => {
              setShowChapterForm(true);
              setEditingChapter(null);
              setChapterTitle("");
              setChapterDesc("");
            }}
          >
            + Add Chapter
          </Button>
        )}

        {showChapterForm && (
          <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 mb-6">
            <h3 className="font-bold mb-4">
              {editingChapter ? "Edit Chapter" : "New Chapter"}
            </h3>
            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g., Introduction"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  placeholder="What's in this chapter?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="emerald">
                  {editingChapter ? "Update" : "Create"} Chapter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowChapterForm(false);
                    setEditingChapter(null);
                    setChapterTitle("");
                    setChapterDesc("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {chapters.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">No chapters yet</h3>
            <p className="text-gray-600">
              Click "+ Add Chapter" above to start building your course.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((ch) => {
              const chapterLessons = lessons
                .filter((l) => l.chapter === ch._id)
                .sort((a, b) => a.order - b.order);

              return (
                <div
                  key={ch._id}
                  className="bg-white border rounded-2xl overflow-hidden"
                >
                  <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase">
                        Chapter {ch.order}
                      </p>
                      <h3 className="font-bold truncate">{ch.title}</h3>
                      {ch.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {ch.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditChapter(ch)}
                        className="text-xs px-2 py-1 rounded hover:bg-blue-100 text-blue-700"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch._id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-100 text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {chapterLessons.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-3">
                        No lessons yet.
                      </p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {chapterLessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className="flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3"
                          >
                            <span className="text-2xl flex-shrink-0">
                              {lesson.isFinalExam
                                ? "🎓"
                                : lesson.hasQuiz
                                ? "📝"
                                : lesson.videoUrl
                                ? "📹"
                                : "📄"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lesson.isFinalExam
                                  ? "Final Exam"
                                  : lesson.hasQuiz
                                  ? "Quiz"
                                  : lesson.videoUrl
                                  ? `Video (${lesson.videoType})`
                                  : "Text lesson"}
                              </p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setLessonModalChapter(ch._id);
                                }}
                                className="text-xs px-2 py-1 rounded hover:bg-blue-100 text-blue-700"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="text-xs px-2 py-1 rounded hover:bg-red-100 text-red-700"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLesson(null);
                        setLessonModalChapter(ch._id);
                      }}
                    >
                      + Add Lesson
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lessonModalChapter && (
        <LessonForm
          chapterId={lessonModalChapter}
          courseId={courseId}
          editingLesson={editingLesson}
          onClose={() => {
            setLessonModalChapter(null);
            setEditingLesson(null);
          }}
          onSaved={() => {
            setLessonModalChapter(null);
            setEditingLesson(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
}