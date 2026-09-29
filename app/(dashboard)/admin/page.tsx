"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type Tab = "overview" | "payments" | "users" | "courses" | "certificates";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  const [manualCode, setManualCode] = useState("");
  const [manualMethod, setManualMethod] = useState("manual");
  const [manualMessage, setManualMessage] = useState("");
  const [manualError, setManualError] = useState("");

  const token = () => localStorage.getItem("horizon_token");

  const loadAll = () => {
    const t = token();
    if (!t) {
      window.location.href = "/login";
      return;
    }
    const headers = { Authorization: `Bearer ${t}` };

    Promise.allSettled([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch("/api/payments/pending", { headers }).then((r) => r.json()),
      fetch("/api/admin/users", { headers }).then((r) => r.json()),
      fetch("/api/admin/courses", { headers }).then((r) => r.json()),
      fetch("/api/certificates", { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [s, p, u, c, cert] = results;
      if (s.status === "fulfilled") setStats(s.value);
      if (p.status === "fulfilled") setPending(p.value.pending || []);
      if (u.status === "fulfilled") setUsers(u.value.users || []);
      if (c.status === "fulfilled") setCourses(c.value.courses || []);
      if (cert.status === "fulfilled")
        setCertificates(cert.value.certificates || []);
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
    if (u.role !== "admin") {
      window.location.href = "/student";
      return;
    }
    setUser(u);
    loadAll();
  }, []);

  const handleApprove = async (
    enrollmentId: string,
    action: "approve" | "reject"
  ) => {
    await fetch("/api/payments/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ enrollmentId, action }),
    });
    loadAll();
  };

  const handleBan = async (userId: string, banned: boolean) => {
    if (banned) {
      const reason = prompt(
        "Reason for banning this user (optional):",
        "Violated terms of service"
      );
      if (reason === null) return;
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ userId, banned: true, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to ban");
        return;
      }
    } else {
      if (!confirm("Unban this user?")) return;
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ userId, banned: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to unban");
        return;
      }
    }
    loadAll();
  };

  const handleManualIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    setManualMessage("");
    if (!manualCode.trim()) {
      setManualError("Code required (e.g., HRZ-1234)");
      return;
    }
    try {
      const res = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          code: manualCode.trim(),
          method: manualMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error || "Failed to approve");
        return;
      }
      setManualMessage(
        `✅ ${data.student} → "${data.course}" approved! Cert: ${data.certificate?.certificateId}`
      );
      setManualCode("");
      loadAll();
    } catch {
      setManualError("Network error");
    }
  };

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "payments", label: "Payments", icon: "💳", badge: pending.length },
    { key: "users", label: "Users", icon: "👥", badge: users.length },
    { key: "courses", label: "Courses", icon: "📚", badge: courses.length },
    {
      key: "certificates",
      label: "Certificates",
      icon: "🏆",
      badge: certificates.length,
    },
  ];

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-500">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Admin Dashboard"
        subtitle={`Welcome, ${user.name} — manage Horizon`}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                    { label: "Total Users", value: stats?.users ?? 0, icon: "👥", color: "bg-blue-50 text-blue-800" },
                    { label: "Total Courses", value: stats?.courses ?? 0, icon: "📚", color: "bg-emerald-50 text-emerald-800" },
                    { label: "Paid Enrollments", value: stats?.enrollments ?? 0, icon: "💳", color: "bg-amber-50 text-amber-800" },
                    { label: "Pending Payments", value: stats?.pending ?? 0, icon: "⏳", color: "bg-red-50 text-red-800" },
                    { label: "Certificates Issued", value: stats?.certificates ?? 0, icon: "🏆", color: "bg-purple-50 text-purple-800" },
                    { label: "Revenue", value: formatPrice(stats?.revenue ?? 0), icon: "💰", color: "bg-emerald-50 text-emerald-800" },
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

            {tab === "payments" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">💳 Payments</h2>
                <div className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold mb-3">🎓 Approve by Student Code</h3>
                  <form onSubmit={handleManualIssue} className="space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter code — e.g., HRZ-4821"
                        className="md:col-span-2 w-full border-2 border-emerald-300 rounded-lg px-4 py-3 font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={manualMethod}
                        onChange={(e) => setManualMethod(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="manual">Manual (cash)</option>
                        <option value="telebirr">Telebirr</option>
                        <option value="cbe">CBE Birr</option>
                        <option value="free">Free / Scholarship</option>
                      </select>
                    </div>
                    {manualError && (
                      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                        {manualError}
                      </div>
                    )}
                    {manualMessage && (
                      <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
                        {manualMessage}
                      </div>
                    )}
                    <Button type="submit" variant="emerald">
                      Approve & Issue Certificate
                    </Button>
                  </form>
                </div>

                <h3 className="font-bold mb-4">Pending Payments</h3>
                {pending.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending payments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pending.map((p) => (
                      <div key={p._id} className="bg-white border rounded-2xl p-5 shadow-sm">
                        <div className="grid md:grid-cols-5 gap-3 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Student</p>
                            <p className="font-semibold">{p.student?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Course</p>
                            <p className="font-semibold">{p.course?.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Method</p>
                            <p className="font-semibold uppercase">{p.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">TX ID</p>
                            <p className="font-mono text-xs break-all">{p.transactionId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Code</p>
                            <p className="font-mono text-lg font-bold text-emerald-700">{p.code}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t">
                          <Button variant="emerald" size="sm" onClick={() => handleApprove(p._id, "approve")}>
                            ✅ Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleApprove(p._id, "reject")}>
                            ❌ Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "users" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">👥 Users</h2>
                <div className="bg-white border rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-4 py-3">Name</th>
                          <th className="text-left px-4 py-3">Email</th>
                          <th className="text-left px-4 py-3">Role</th>
                          <th className="text-left px-4 py-3">Status</th>
                          <th className="text-left px-4 py-3">Joined</th>
                          <th className="text-left px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id} className="border-t">
                            <td className="px-4 py-3 font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                                  u.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : u.role === "teacher"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {u.banned ? (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold uppercase">
                                  🚫 Banned
                                </span>
                              ) : (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold uppercase">
                                  ✓ Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              {u.role === "admin" ? (
                                <span className="text-xs text-gray-400">—</span>
                              ) : u.banned ? (
                                <button
                                  onClick={() => handleBan(u._id, false)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition"
                                >
                                  ✅ Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBan(u._id, true)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition"
                                >
                                  🚫 Ban
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === "courses" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📚 Courses</h2>
                {courses.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <p className="text-gray-500">No courses yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.map((c) => (
                      <div key={c._id} className="bg-white border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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
                        <h3 className="font-bold text-lg mb-1">{c.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {c.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-blue-800">
                            {c.price === 0 ? "Free" : formatPrice(c.price)}
                          </span>
                          <span className="text-gray-500 text-xs">
                            👨‍🏫 {c.teacher?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "certificates" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">🏆 Certificates</h2>
                {certificates.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <p className="text-gray-500">No certificates issued yet.</p>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="text-left px-4 py-3">Certificate ID</th>
                            <th className="text-left px-4 py-3">Student</th>
                            <th className="text-left px-4 py-3">Course</th>
                            <th className="text-left px-4 py-3">Issued</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificates.map((c) => (
                            <tr key={c._id} className="border-t">
                              <td className="px-4 py-3 font-mono text-xs text-blue-800 font-semibold">
                                {c.certificateId}
                              </td>
                              <td className="px-4 py-3 font-medium">{c.studentName}</td>
                              <td className="px-4 py-3 text-gray-600">{c.courseTitle}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {new Date(c.issuedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}