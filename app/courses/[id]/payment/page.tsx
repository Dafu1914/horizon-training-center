"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [enrollmentId, setEnrollmentId] = useState("");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<"online" | "manual">("online");
  const [method, setMethod] = useState<"telebirr" | "cbe">("telebirr");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("horizon_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const enr = (d.enrollments || []).find(
          (e: any) => e.course?._id === courseId
        );
        if (enr) {
          setEnrollmentId(enr._id);
          setCode(enr.code || "");
        }
      });
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!enrollmentId) {
      setError("No enrollment found. Please enroll first.");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("horizon_token");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollmentId,
          method,
          transactionId,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit payment");
        setLoading(false);
        return;
      }

      setSuccess(
        "Payment submitted! Admin will verify and unlock your course soon."
      );
      setTimeout(() => router.push("/student"), 2500);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  const phoneNumber = method === "telebirr" ? "0911-XXX-XXX" : "1000-XXX-XXX";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-blue-800 hover:underline text-sm"
      >
        ← Back to Course
      </Link>

      <h1 className="text-3xl font-bold mt-6 mb-2">Complete Your Payment</h1>
      <p className="text-gray-600 mb-8">
        Choose how you want to pay for this course.
      </p>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setTab("online")}
          className={`flex-1 py-4 rounded-xl border-2 font-semibold transition ${
            tab === "online"
              ? "border-blue-800 bg-blue-50 text-blue-900"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          📱 Pay Online
          <span className="block text-xs font-normal mt-1 opacity-70">
            Telebirr / CBE Birr
          </span>
        </button>
        <button
          onClick={() => setTab("manual")}
          className={`flex-1 py-4 rounded-xl border-2 font-semibold transition ${
            tab === "manual"
              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          💵 Pay Later / Cash
          <span className="block text-xs font-normal mt-1 opacity-70">
            Get code, contact admin
          </span>
        </button>
      </div>

      {tab === "online" && (
        <>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-lg mb-3">📱 How to Pay Online</h2>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>
                Open your <strong>Telebirr</strong> or <strong>CBE Birr</strong> app
              </li>
              <li>Send the course fee to the number below</li>
              <li>
                <strong>Copy the transaction ID</strong> (reference number)
              </li>
              <li>Fill the form below and submit</li>
              <li>Admin verifies → your course unlocks</li>
            </ol>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setMethod("telebirr")}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition ${
                method === "telebirr"
                  ? "border-blue-800 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              📱 Telebirr
            </button>
            <button
              onClick={() => setMethod("cbe")}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition ${
                method === "cbe"
                  ? "border-blue-800 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              🏦 CBE Birr
            </button>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 text-center">
            <p className="text-sm text-gray-600 mb-1">Send payment to:</p>
            <p className="text-2xl font-bold text-emerald-700 tracking-wide">
              {phoneNumber}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Replace with your real Telebirr / CBE number later)
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border rounded-2xl p-6 space-y-4"
          >
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Transaction ID / Reference Number *
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. FTF123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Note (optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Any additional info..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Payment Proof"}
            </Button>
          </form>
        </>
      )}

      {tab === "manual" && (
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">💵 Pay Later / Cash</h2>
          <p className="text-gray-700 mb-6">
            Pay in person, via cash, or through any method you prefer. Use the
            code below to identify your payment.
          </p>

          <div className="bg-blue-800 text-white rounded-xl p-6 mb-6 text-center">
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">
              Your Payment Code
            </p>
            <p className="text-4xl font-bold tracking-widest font-mono">
              {code || "Loading..."}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-lg mb-2">How it works:</h3>
            <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
              <li>
                <strong>Pay the course fee</strong> in person or by cash
              </li>
              <li>
                <strong>Send your code</strong> to the admin via:
                <div className="mt-2 ml-4 space-y-1">
                  <p>📞 Phone: <span className="font-mono">+251 911 XXX XXX</span></p>
                  <p>💬 Telegram: <span className="font-mono">@HorizonAdmin</span></p>
                  <p>📱 WhatsApp: <span className="font-mono">+251 911 XXX XXX</span></p>
                </div>
              </li>
              <li>
                Admin will <strong>verify</strong> and approve
              </li>
              <li>
                Your course will be <strong>unlocked</strong> + certificate issued
              </li>
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mt-4">
              ⏳ <strong>Wait for admin approval.</strong> Once approved, the
              course appears in your dashboard as PAID and your certificate is
              generated automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
