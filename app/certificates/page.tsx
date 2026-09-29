"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Certificate = {
  _id: string;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  issuedAt: string;
  course?: { title: string; category: string };
};

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("horizon_token");
    const stored = localStorage.getItem("horizon_user");

    if (!token || !stored) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(stored));

    fetch("/api/certificates", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setCerts(d.certificates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 My Certificates</h1>
        <p className="text-gray-600">
          {user?.role === "admin"
            ? "All issued certificates on Horizon."
            : "Your earned certificates from completed courses."}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading certificates...</div>
      ) : certs.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-bold mb-2">No certificates yet</h2>
          <p className="text-gray-600 mb-6">
            Complete a course and get your certificate.
          </p>
          <Link href="/courses">
            <Button variant="emerald">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certs.map((c) => (
            <div
              key={c._id}
              className="bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🏆</span>
                <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full font-mono">
                  {c.certificateId}
                </span>
              </div>

              <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
                Certificate of Completion
              </p>
              <h2 className="text-2xl font-bold mb-4">
                {c.courseTitle || c.course?.title}
              </h2>

              <div className="border-t border-white/20 pt-4">
                <p className="text-sm text-white/80">
                  Awarded to{" "}
                  <span className="font-semibold">{c.studentName}</span>
                </p>
                <p className="text-sm text-white/80">
                  Instructor:{" "}
                  <span className="font-semibold">
                    {c.teacherName || "Horizon"}
                  </span>
                </p>
                <p className="text-xs text-white/60 mt-2">
                  Issued:{" "}
                  {new Date(c.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="mt-6">
                <Link href={`/certificates/${c._id}`}>
                  <Button variant="white" size="sm">
                    View Certificate →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}