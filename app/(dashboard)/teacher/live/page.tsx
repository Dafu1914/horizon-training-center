"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Course = {
  _id: string;
  title: string;
};

type Session = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  roomId: string;
  course: { _id: string; title: string };
};

export default function TeacherLivePage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: 60,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = () => localStorage.getItem("horizon_token");

  const loadAll = () => {
    const t = token();
    if (!t) return;

    Promise.all([
      fetch(`/api/courses?teacher=${user?.id}`, {
        headers: { Authorization: `Bearer ${t}` },
      }).then((r) => r.json()),
      fetch("/api/live", {
        headers: { Authorization: `Bearer ${t}` },
      }).then((r) => r.json()),
    ]).then(([coursesData, sessionsData]) => {
      setCourses(coursesData.courses || []);
      setSessions(sessionsData.sessions || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    const t = localStorage.getItem("horizon_token");

    if (!stored || !t) {
      window.location.href = "/login";
      return;
    }

    const u = JSON.parse(stored);
    if (u.role !== "teacher" && u.role !== "admin") {
      window.location.href = "/student";
      return;
    }

    setUser(u);

    Promise.all([
      fetch(`/api/courses?teacher=${u.id}`, {
        headers: { Authorization: `Bearer ${t}` },
      }).then((r) => r.json()),
      fetch("/api/live", {
        headers: { Authorization: `Bearer ${t}` },
      }).then((r) => r.json()),
    ])
      .then(([coursesData, sessionsData]) => {
        setCourses(coursesData.courses || []);
        setSessions(sessionsData.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.courseId || !form.title || !form.scheduledAt) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/live/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create session");
        setSubmitting(false);
        return;
      }

      setSuccess(data.message);
      setForm({
        courseId: "",
        title: "",
        description: "",
        scheduledAt: "",
        durationMinutes: 60,
      });

      // Reload sessions
      fetch("/api/live", {
        headers: { Authorization: `Bearer ${token()}` },
      })
        .then((r) => r.json())
        .then((d) => setSessions(d.sessions || []));
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    const styles: any = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-red-100 text-red-800 animate-pulse",
      ended: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-50 text-red-500",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const upcoming = sessions.filter(
    (s) => new Date(s.scheduledAt) >= new Date() && s.status !== "cancelled"
  );
  const past = sessions.filter((s) => new Date(s.scheduledAt) < new Date());

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/teacher"
          className="text-blue-800 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-3 mb-1">🎥 Live Sessions</h1>
        <p className="text-gray-600">
          Schedule live classes. Enrolled students will be notified.
        </p>
      </div>

      {/* ============ SCHEDULE FORM ============ */}
      <div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4">📅 Schedule a Live Class</h2>

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

        {courses.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            ⚠️ You haven't created any courses yet. Create one first, then
            come back here.
            <br />
            <Link href="/teacher/create" className="font-semibold underline">
              Create a course →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Course *
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) =>
                    setForm({ ...form, courseId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g., Algebra Review"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What will you cover?"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm({ ...form, scheduledAt: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="emerald"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Scheduling..." : "🎥 Schedule Live Session"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              All enrolled students will be notified automatically.
            </p>
          </form>
        )}
      </div>

      {/* ============ UPCOMING ============ */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          🔔 Upcoming Sessions ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <p className="text-gray-500">No upcoming sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div
                key={s._id}
                className="bg-white border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${statusBadge(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {s.course?.title}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                    {s.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {s.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      📅{" "}
                      {new Date(s.scheduledAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      • ⏱️ {s.durationMinutes} min
                    </p>
                  </div>

                  <Link href={`/live/${s._id}`} className="flex-shrink-0">
                    <Button variant="emerald" size="sm">
                      Join →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ PAST ============ */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Past Sessions</h2>
          <div className="space-y-2">
            {past.map((s) => (
              <div
                key={s._id}
                className="bg-gray-50 border rounded-xl p-4 opacity-75"
              >
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(s.scheduledAt).toLocaleString()} • {s.course?.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}