"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type Tab = "overview" | "courses" | "live" | "certificates" | "inbox";

type Enrollment = {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    files?: any[];
  };
  paymentStatus: string;
  progress: number;
};

type Session = {
  _id: string;
  title: string;
  scheduledAt: string;
  status: string;
  course: { title: string };
};

type Certificate = {
  _id: string;
  certificateId: string;
  courseTitle: string;
  issuedAt: string;
};

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    const token = localStorage.getItem("horizon_token");

    if (!stored || !token) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(stored));
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("/api/enrollments", { headers }).then((r) => r.json()),
      fetch("/api/live?upcoming=true", { headers }).then((r) => r.json()),
      fetch("/api/certificates", { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [e, s, c] = results;
      if (e.status === "fulfilled") setEnrollments(e.value.enrollments || []);
      if (s.status === "fulfilled") setSessions(s.value.sessions || []);
      if (c.status === "fulfilled") setCertificates(c.value.certificates || []);
      setLoading(false);
    });
  }, []);

  const paidEnrollments = enrollments.filter(
    (e) => e.paymentStatus === "paid" || e.paymentStatus === "free"
  );
  const pendingEnrollments = enrollments.filter(
    (e) => e.paymentStatus === "pending" || e.paymentStatus === "submitted"
  );

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "courses", label: "My Courses", icon: "📚", badge: paidEnrollments.length },
    { key: "live", label: "Live Classes", icon: "🎥", badge: sessions.length },
    { key: "certificates", label: "Certificates", icon: "🏆", badge: certificates.length },
    { key: "inbox", label: "Inbox", icon: "💬" },
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
        title="Student Dashboard"
        subtitle={`Welcome back, ${user.name}!`}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Student Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Welcome back, {user.name}!
            </p>
          </div>
          <Link href="/courses">
            <Button variant="emerald">Browse Courses</Button>
          </Link>
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
                    { label: "Enrolled Courses", value: paidEnrollments.length, icon: "📚", color: "bg-blue-50 text-blue-800" },
                    { label: "Pending Payment", value: pendingEnrollments.length, icon: "⏳", color: "bg-amber-50 text-amber-800" },
                    { label: "Live Classes", value: sessions.length, icon: "🎥", color: "bg-emerald-50 text-emerald-800" },
                    { label: "Certificates", value: certificates.length, icon: "🏆", color: "bg-purple-50 text-purple-800" },
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
                {enrollments.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-6">Browse courses and enroll to start learning.</p>
                    <Link href="/courses">
                      <Button variant="emerald">Browse Courses</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrollments.map((e) => (
                      <Link
                        key={e._id}
                        href={`/courses/${e.course?._id}`}
                        className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition block"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {e.course?.category || "General"}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                              e.paymentStatus === "paid" || e.paymentStatus === "free"
                                ? "bg-emerald-100 text-emerald-700"
                                : e.paymentStatus === "pending" || e.paymentStatus === "submitted"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {e.paymentStatus}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{e.course?.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{e.course?.description}</p>
                        <div className="flex items-center justify-between text-sm pt-3 border-t">
                          <span className="font-bold text-blue-800">
                            {e.course?.price === 0 ? "Free" : formatPrice(e.course?.price || 0)}
                          </span>
                          <span className="text-xs text-gray-500">
                            📎 {e.course?.files?.length || 0} material{(e.course?.files?.length || 0) === 1 ? "" : "s"}
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
                <h2 className="text-2xl font-bold mb-6">🎥 Upcoming Live Classes</h2>
                {sessions.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🎥</div>
                    <h3 className="text-xl font-bold mb-2">No upcoming classes</h3>
                    <p className="text-gray-600">Teachers haven't scheduled any live classes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
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
                            <Button variant="emerald" size="sm">Join →</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "certificates" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">🏆 My Certificates</h2>
                {certificates.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold mb-2">No certificates yet</h3>
                    <p className="text-gray-600">Complete a course to earn your certificate.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((c) => (
                      <Link
                        key={c._id}
                        href={`/certificates/${c._id}`}
                        className="bg-gradient-to-br from-blue-900 to-emerald-600 rounded-2xl p-5 text-white shadow-sm hover:shadow-lg transition"
                      >
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                          Certificate of Completion
                        </p>
                        <h3 className="font-bold text-lg mb-3">{c.courseTitle}</h3>
                        <p className="text-xs opacity-80 font-mono">{c.certificateId}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "inbox" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">💬 Inbox</h2>
                <div className="bg-white border rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">Open your full inbox</h3>
                  <p className="text-gray-600 mb-6">
                    View all notifications and messages from your teachers.
                  </p>
                  <Link href="/inbox">
                    <Button variant="emerald">Go to Inbox</Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}