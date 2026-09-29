"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import QuizModal from "@/components/course/QuizModal";

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
  textContent: string;
  attachments: any[];
  hasQuiz: boolean;
  questions?: any[];
  passingScore?: number;
  isFinalExam: boolean;
  durationMinutes: number;
  completed: boolean;
  quizPassed: boolean;
  quizAttempts?: number;
};

type Course = {
  _id: string;
  title: string;
  description: string;
  teacher?: { name: string; email: string };
};

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const [completing, setCompleting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [celebration, setCelebration] = useState<{
    show: boolean;
    certificateId?: string;
  }>({ show: false });

  const token = () => localStorage.getItem("horizon_token");

  const load = () => {
    const t = token();
    if (!t) {
      router.push("/login");
      return;
    }
    fetch(`/api/learn/${courseId}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setCourse(d.course);
          setChapters(d.chapters || []);
          setLessons(d.lessons || []);
          setProgress(d.progress);

          setActiveLessonId((prev) => {
            if (prev && d.lessons?.some((l: Lesson) => l._id === prev)) {
              return prev;
            }
            const firstIncomplete =
              (d.lessons || []).find((l: Lesson) => !l.completed) ||
              (d.lessons || [])[0];
            return firstIncomplete?._id || "";
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    if (stored) setUser(JSON.parse(stored));
    load();
  }, [courseId]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l._id === activeLessonId),
    [lessons, activeLessonId]
  );

  const lessonStatus = (lesson: Lesson): "done" | "current" | "locked" => {
    if (lesson.completed) return "done";
    const idx = lessons.findIndex((l) => l._id === lesson._id);
    if (idx === 0) return "current";
    const prev = lessons[idx - 1];
    if (prev.completed) return "current";
    return "locked";
  };

  const handleComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    const t = token();
    try {
      const res = await fetch("/api/learn/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ lessonId: activeLesson._id }),
      });
      const data = await res.json();

      if (data.certificateIssued && data.certificate) {
        setCelebration({
          show: true,
          certificateId: data.certificate._id,
        });
      }

      load();
    } catch {
      // ignore
    }
    setCompleting(false);
  };

  const getVideoEmbed = (lesson: Lesson) => {
    if (lesson.videoType === "youtube") {
      const id = extractYouTubeId(lesson.videoUrl);
      if (id)
        return (
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        );
    }
    if (lesson.videoType === "vimeo") {
      const id = extractVimeoId(lesson.videoUrl);
      if (id)
        return (
          <iframe
            src={`https://player.vimeo.com/video/${id}`}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        );
    }
    if (lesson.videoType === "upload") {
      return (
        <video
          src={lesson.videoUrl}
          controls
          className="w-full h-full bg-black"
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
        No video for this lesson
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-3">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error.includes("Not enrolled")
              ? "Enroll and complete payment to access this course."
              : "Please try again or go back to the course page."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/courses/${courseId}`}>
              <Button variant="emerald">Go to Course</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={course?.title || "Learning"}
        subtitle={
          progress
            ? `${progress.completedLessons}/${progress.totalLessons} lessons complete`
            : ""
        }
        homeHref="/student"
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href={`/courses/${courseId}`}
          className="text-blue-800 hover:underline text-sm"
        >
          ← Back to Course
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-4">
          {/* ====== MAIN VIDEO AREA ====== */}
          <div className="space-y-4">
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              {activeLesson ? (
                getVideoEmbed(activeLesson)
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Select a lesson
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="bg-white border rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {chapters.find((c) => c._id === activeLesson.chapter)
                        ?.title || ""}
                    </p>
                    <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
                  </div>
                  {activeLesson.completed && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                      ✓ Completed
                    </span>
                  )}
                </div>

                {activeLesson.textContent && (
                  <div className="text-gray-700 whitespace-pre-line mb-4">
                    {activeLesson.textContent}
                  </div>
                )}

                {activeLesson.attachments &&
                  activeLesson.attachments.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-semibold mb-2">
                        📎 Attachments
                      </p>
                      <div className="space-y-2">
                        {activeLesson.attachments.map((a: any, i: number) => (
                          <a
                            key={i}
                            href={a.url}
                            download={a.name}
                            className="flex items-center gap-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2"
                          >
                            📄 {a.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* ===== QUIZ SECTION ===== */}
                {activeLesson.hasQuiz &&
                  activeLesson.questions &&
                  activeLesson.questions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-bold text-blue-900 mb-1">
                              📝 Lesson Quiz
                            </p>
                            <p className="text-xs text-blue-800">
                              {activeLesson.questions.length} questions • Pass
                              with {activeLesson.passingScore || 70}% or higher
                            </p>
                            {activeLesson.quizPassed && (
                              <p className="text-xs text-emerald-700 font-semibold mt-1">
                                ✓ You already passed this quiz
                              </p>
                            )}
                          </div>
                          <Button
                            variant={
                              activeLesson.quizPassed ? "outline" : "primary"
                            }
                            size="sm"
                            onClick={() => setShowQuiz(true)}
                          >
                            {activeLesson.quizPassed
                              ? "Retake Quiz"
                              : "Take Quiz"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ===== COMPLETE BUTTON ===== */}
                <div className="flex gap-3 pt-4 border-t mt-4">
                  {!activeLesson.completed ? (
                    <Button
                      variant="emerald"
                      onClick={handleComplete}
                      disabled={completing}
                      className="flex-1"
                    >
                      {completing
                        ? "Completing..."
                        : "✓ Mark Complete & Continue"}
                    </Button>
                  ) : (
                    <span className="flex-1 text-center text-sm text-emerald-700 font-medium py-2.5 bg-emerald-50 rounded-lg">
                      ✓ You've completed this lesson
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ====== SIDEBAR ====== */}
          <aside className="bg-white border rounded-2xl h-fit lg:sticky lg:top-24">
            {progress && (
              <div className="p-4 border-b bg-gradient-to-r from-blue-800 to-emerald-600 text-white rounded-t-2xl">
                <p className="text-xs uppercase tracking-wider opacity-90 mb-1">
                  Your progress
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentComplete}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {progress.percentComplete}%
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {progress.completedLessons} of {progress.totalLessons} lessons
                </p>
              </div>
            )}

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {chapters.map((ch) => {
                const chapterLessons = lessons
                  .filter((l) => l.chapter === ch._id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div key={ch._id} className="mb-4">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                      Chapter {ch.order}: {ch.title}
                    </p>
                    <div className="space-y-1">
                      {chapterLessons.map((lesson) => {
                        const status = lessonStatus(lesson);
                        const isActive = lesson._id === activeLessonId;
                        const locked = status === "locked";

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => {
                              if (!locked) {
                                setActiveLessonId(lesson._id);
                                setShowQuiz(false);
                              }
                            }}
                            disabled={locked}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition ${
                              isActive
                                ? "bg-blue-800 text-white"
                                : locked
                                ? "text-gray-400 cursor-not-allowed"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span className="flex-shrink-0">
                              {status === "done"
                                ? "✅"
                                : locked
                                ? "🔒"
                                : isActive
                                ? "▶️"
                                : "⚪"}
                            </span>
                            <span className="flex-1 truncate">
                              {lesson.title}
                            </span>
                            {lesson.isFinalExam && (
                              <span className="text-xs">🎓</span>
                            )}
                            {lesson.hasQuiz && (
                              <span className="text-xs">📝</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {chapters.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">
                  No lessons added yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ===== QUIZ MODAL ===== */}
      {showQuiz && activeLesson && activeLesson.questions && (
        <QuizModal
          lessonId={activeLesson._id}
          lessonTitle={activeLesson.title}
          questions={activeLesson.questions}
          passingScore={activeLesson.passingScore || 70}
          onClose={() => setShowQuiz(false)}
          onPassed={() => {
            setShowQuiz(false);
            load();
          }}
        />
      )}

      {/* ===== 🎉 CELEBRATION MODAL ===== */}
      {celebration.show && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2 text-blue-900">
              Congratulations!
            </h2>
            <p className="text-gray-600 mb-6">
              You've completed the entire course!
            </p>

            <div className="bg-gradient-to-br from-blue-900 to-emerald-600 rounded-2xl p-6 text-white mb-6">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                Certificate of Completion
              </p>
              <p className="font-bold text-lg">{course?.title}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Your certificate has been issued and is ready to download.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href={
                  celebration.certificateId
                    ? `/certificates/${celebration.certificateId}`
                    : "/certificates"
                }
              >
                <Button variant="emerald" className="w-full">
                  🏆 View Certificate
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCelebration({ show: false })}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Helpers =====
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}