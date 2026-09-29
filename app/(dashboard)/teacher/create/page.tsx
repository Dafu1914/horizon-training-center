"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CreateCoursePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "General",
    level: "Beginner",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("horizon_token");
    const u = localStorage.getItem("horizon_user");
    if (!t || !u) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(u);
    if (user.role !== "teacher" && user.role !== "admin") {
      window.location.href = "/student";
      return;
    }
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create course");
        setLoading(false);
        return;
      }

      // Log for debugging
      console.log("Course created:", data);
      console.log("Course ID:", data.course?._id);

      setSuccess(
        "Course created! Redirecting to upload page in 1 second..."
      );

      // Redirect to upload page
      const courseId = data.course?._id;
      if (courseId) {
        setTimeout(() => {
          window.location.href = `/teacher/courses/${courseId}`;
        }, 1000);
      } else {
        setError("Course created but no ID returned — check console");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Create course error:", err);
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link
          href="/teacher"
          className="text-blue-800 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Create a Course</h1>
      <p className="text-gray-600 mb-8">
        Fill in the details. After creating, you'll upload files.
      </p>

      <div className="bg-white border rounded-2xl p-8 shadow-sm">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., Mathematics Grade 12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="What will students learn?"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (ETB)
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option>General</option>
                <option>Math</option>
                <option>Science</option>
                <option>Language</option>
                <option>Tech</option>
                <option>Business</option>
                <option>Art</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            💡 After creating your course, you'll be redirected to upload
            files (PDF, videos, slides, images) that your students can
            download.
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </div>
    </div>
  );
}