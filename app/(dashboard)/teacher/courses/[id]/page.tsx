"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import FileUploader from "@/components/course/FileUploader";
import { formatPrice } from "@/lib/utils";

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  status: string;
  files: any[];
  teacher?: { name: string; email: string };
};

export default function ManageCoursePage() {
  const params = useParams();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterCount, setChapterCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    if (!stored) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(stored);
    if (user.role !== "teacher" && user.role !== "admin") {
      window.location.href = "/student";
      return;
    }

    const token = localStorage.getItem("horizon_token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch(`/api/courses/${id}`).then((r) => r.json()),
      fetch(`/api/chapters?course=${id}`, { headers }).then((r) => r.json()),
      fetch(`/api/lessons?course=${id}`, { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [c, ch, ls] = results;
      if (c.status === "fulfilled") setCourse(c.value.course || null);
      if (ch.status === "fulfilled")
        setChapterCount((ch.value.chapters || []).length);
      if (ls.status === "fulfilled")
        setLessonCount((ls.value.lessons || []).length);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-gray-500">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Link href="/teacher">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title={course.title}
        subtitle="Manage course materials"
        homeHref="/teacher"
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/teacher" className="text-blue-800 hover:underline text-sm">
          ← Back to Dashboard
        </Link>

        <div className="mt-6 mb-8">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium mb-3">
            {course.category} • {course.level}
          </span>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-3">{course.description}</p>
          <p className="text-sm text-gray-500">
            💰 {course.price === 0 ? "Free" : formatPrice(course.price)} • Status:{" "}
            <span className="font-semibold">{course.status}</span>
          </p>
        </div>

        {/* ============ 📚 COURSE CONTENT (Lessons/Chapters) ============ */}
        <div className="bg-gradient-to-r from-blue-800 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-xl font-bold mb-1">📚 Course Content</h2>
              <p className="text-sm text-white/90 mb-3">
                Build your course with chapters, lessons, videos, and quizzes.
              </p>
              <div className="flex gap-4 text-sm">
                <span>
                  <strong className="text-lg">{chapterCount}</strong>{" "}
                  chapter{chapterCount !== 1 ? "s" : ""}
                </span>
                <span>
                  <strong className="text-lg">{lessonCount}</strong>{" "}
                  lesson{lessonCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <Link href={`/teacher/courses/${course._id}/chapters`}>
              <Button variant="white" size="lg">
                Manage Lessons →
              </Button>
            </Link>
          </div>
        </div>

        {/* ============ 📁 FILE MATERIALS ============ */}
        <div className="bg-white border rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">📁 Course Materials</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload files (PDF, PPT, images, etc.) that your students can
            download.
          </p>
          <FileUploader courseId={course._id} initialFiles={course.files || []} />
        </div>

        {/* ============ 💡 INFO ============ */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">
            💡 What students will see
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              📚 <strong>Course Content</strong> — the chapters and lessons you
              build appear as a step-by-step learning path
            </li>
            <li>
              📁 <strong>Course Materials</strong> — the files you upload here
              can be downloaded by students
            </li>
            <li>
              🔒 Students need to <strong>complete lessons in order</strong> —
              step-by-step progression
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}