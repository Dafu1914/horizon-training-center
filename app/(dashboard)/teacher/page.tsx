"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type Tab = "overview" | "courses" | "live" | "messages";

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  status: string;
  files?: any[];
  students?: any[];
};

type Session = {
  _id: string;
  title: string;
  scheduledAt: string;
  status: string;
  course: { title: string };
};

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    const token = localStorage.getItem("horizon_token");

    if (!stored || !token) {
      window.location.href = "/login";
      return;
    }

    const u = JSON.parse(stored);
    if (u.role !== "teacher" && u.role !== "admin") {
      window.location.href = "/student";
      return;
    }

    setUser(u);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch(`/api/courses?teacher=${u.id}`, { headers }).then((r) => r.json()),
      fetch(`/api/live`, { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [c, s] = results;
      if (c.status === "fulfilled") setCourses(c.value.courses || []);
      if (s.status === "fulfilled") setSessions(s.value.sessions || []);
      setLoading(false);
    });
  }, []);

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) >= new Date() && s.status !== "cancelled"
  );

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "courses", label: "My Courses", icon: "📚", badge: courses.length },
    { key: "live", label: "Live Sessions", icon: "🎥", badge: upcomingSessions.length },
    { key: "messages", label: "Messages", icon: "💬" },
  ];

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Teacher Dashboard"
        subtitle={`Welcome, ${user.name} — manage your courses`}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Teacher Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Welcome back, {user.name}!
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/teacher/live">
              <Button variant="primary">🎥 Schedule Live</Button>
            </Link>
            <Link href="/teacher/create">
              <Button variant="emerald">+ Create Course</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border rounded-2xl p-4 h-fit sticky top-24">
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    tab === t.key
                      ? "bg-blue-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        tab === t.key
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <main>
            {tab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📊 Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "My Courses", value: courses.length, icon: "📚", color: "bg-blue-50 text-blue-800" },
                    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: "🎥", color: "bg-emerald-50 text-emerald-800" },
                    { label: "Total Students", value: courses.reduce((sum: number, c: any) => sum + (c.students?.length || 0), 0), icon: "👥", color: "bg-amber-50 text-amber-800" },
                  ].map((s, i) => (
                    <div key={i} className={`${s.color} rounded-2xl p-5 border border-white/40`}>
                      <div className="text-3xl mb-2">{s.icon}</div>
                      <p className="text-sm opacity-80">{s.label}</p>
                      <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "courses" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📚 My Courses</h2>
                {courses.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-6">Create your first course.</p>
                    <Link href="/teacher/create">
                      <Button variant="emerald">Create Course</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.map((c) => (
                      <Link
                        key={c._id}
                        href={`/teacher/courses/${c._id}`}
                        className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition block"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {c.category}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                              c.status === "published"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{c.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{c.description}</p>
                        <div className="flex items-center justify-between text-sm pt-3 border-t">
                          <span className="font-bold text-blue-800">
                            {c.price === 0 ? "Free" : formatPrice(c.price)}
                          </span>
                          <span className="text-xs text-gray-500">
                            📎 {c.files?.length || 0} file{c.files?.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "live" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">🎥 Upcoming Live Sessions</h2>
                  <Link href="/teacher/live">
                    <Button variant="emerald" size="sm">+ New Session</Button>
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🎥</div>
                    <h3 className="text-xl font-bold mb-2">No upcoming sessions</h3>
                    <p className="text-gray-600 mb-6">Schedule a live class for your students.</p>
                    <Link href="/teacher/live">
                      <Button variant="emerald">Schedule Live Session</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <div key={s._id} className="bg-white border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {s.course?.title}
                            </span>
                            <h3 className="font-bold text-lg mt-2 mb-1">{s.title}</h3>
                            <p className="text-xs text-gray-500">
                              📅 {new Date(s.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                          <Link href={`/live/${s._id}`}>
                            <Button variant="emerald" size="sm">Start →</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "messages" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">💬 Messages</h2>
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">Inbox coming soon</h3>
                  <p className="text-gray-600">Send and receive messages with your students.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
