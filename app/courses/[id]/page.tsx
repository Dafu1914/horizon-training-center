"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CourseMaterials from "@/components/course/CourseMaterials";
import { formatPrice } from "@/lib/utils";

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  files?: any[];
  teacher?: { name: string; email: string };
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.courses || []).find((c: Course) => c._id === id);
        setCourse(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("horizon_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setEnrolling(true);

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code) {
          setMessage("You are already enrolled. Redirecting to payment...");
          setTimeout(() => router.push(`/courses/${id}/payment`), 1200);
        } else {
          setError(data.error || "Enrollment failed");
        }
        setEnrolling(false);
        return;
      }

      if (data.requiresPayment) {
        setMessage("Enrollment created! Redirecting to payment...");
        setTimeout(() => router.push(`/courses/${id}/payment`), 1200);
      } else {
        setMessage("Enrolled successfully! Redirecting...");
        setTimeout(() => router.push("/student"), 1500);
      }
    } catch {
      setError("Network error");
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-500">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button onClick={() => router.push("/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-emerald-600 rounded-3xl p-10 text-white mb-10">
        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
          {course.category}
        </span>
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-white/90 max-w-2xl mb-6">{course.description}</p>
        <div className="flex gap-6 text-sm text-white/90">
          <span>👨‍🏫 {course.teacher?.name || "Teacher"}</span>
          <span>📊 {course.level}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-4">What You'll Learn</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Live weekly classes with your teacher</li>
              <li>✅ Recorded videos for every session</li>
              <li>✅ Interactive Q&A during live classes</li>
              <li>✅ Certificate after completion</li>
            </ul>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-4">Course Details</h2>
            <p className="text-gray-600">
              Level: <span className="font-semibold">{course.level}</span>
              <br />
              Category:{" "}
              <span className="font-semibold">{course.category}</span>
              <br />
              Teacher:{" "}
              <span className="font-semibold">
                {course.teacher?.name || "TBA"}
              </span>
            </p>
          </div>

          {/* 📁 Course Materials */}
          <CourseMaterials
            files={course.files || []}
            courseId={course._id}
            coursePrice={course.price}
          />
        </div>

        {/* Right column - Enroll card */}
        <div className="bg-white border rounded-2xl p-6 h-fit sticky top-24">
          <p className="text-4xl font-bold text-blue-800 mb-2">
            {course.price === 0 ? "Free" : formatPrice(course.price)}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {course.price === 0 ? "No payment needed" : "One-time payment"}
          </p>

          {message && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-3">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-3">
              {error}
            </div>
          )}

          <Button
            className="w-full mb-3"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </Button>

          {/* ⭐ Start Learning button */}
          <Link href={`/courses/${course._id}/learn`} className="block">
            <Button variant="emerald" className="w-full mb-3">
              ▶️ Start Learning
            </Button>
          </Link>

          {course.price > 0 && (
            <p className="text-xs text-gray-500 text-center">
              Pay with Telebirr or CBE Birr
            </p>
          )}

          <div className="border-t mt-6 pt-6 text-sm space-y-2">
            <p className="flex justify-between">
              <span>Access</span>
              <span className="font-semibold">Lifetime</span>
            </p>
            <p className="flex justify-between">
              <span>Live classes</span>
              <span className="font-semibold">Yes</span>
            </p>
            <p className="flex justify-between">
              <span>Certificate</span>
              <span className="font-semibold">Yes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}