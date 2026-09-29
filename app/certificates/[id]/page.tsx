"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Certificate = {
  _id: string;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  issuedAt: string;
};

export default function CertificateViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("horizon_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("/api/certificates", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.certificates || []).find(
          (c: Certificate) => c._id === id
        );
        setCert(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading certificate...
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Certificate not found</h1>
        <Link href="/certificates">
          <Button>Back to Certificates</Button>
        </Link>
      </div>
    );
  }

  const issued = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/certificates"
            className="text-blue-800 hover:underline text-sm font-medium"
          >
            ← Back to Certificates
          </Link>
          <Button
            variant="emerald"
            onClick={() => window.print()}
          >
            🖨️ Print / Save as PDF
          </Button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-r from-blue-900 to-emerald-600 p-12 text-center text-white">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-sm tracking-[0.3em] uppercase opacity-90 mb-2">
              Horizon Virtual Training Center
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Certificate of Completion
            </h1>
          </div>

          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">This is to certify that</p>
            <p className="text-4xl font-bold text-blue-900 mb-6 border-b-2 border-emerald-500 inline-block pb-2 px-6">
              {cert.studentName}
            </p>

            <p className="text-gray-600 mb-3">
              has successfully completed the course
            </p>
            <p className="text-2xl font-bold text-slate-800 mb-8">
              "{cert.courseTitle}"
            </p>

            <p className="text-gray-600 mb-12">
              awarded by Horizon Virtual Training Center.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-12 max-w-2xl mx-auto text-sm">
              <div className="border-t border-gray-300 pt-3">
                <p className="font-semibold text-slate-800">
                  {cert.teacherName || "Horizon Team"}
                </p>
                <p className="text-gray-500 text-xs">Instructor</p>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <p className="font-semibold text-slate-800">
                  {new Date(cert.issuedAt).toLocaleDateString("en-US")}
                </p>
                <p className="text-gray-500 text-xs">Date Issued</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Certificate ID:{" "}
                <span className="font-mono font-semibold text-blue-800">
                  {cert.certificateId}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Verify at horizon-training.com/verify
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}