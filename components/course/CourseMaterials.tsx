"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FileItem = {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

type Props = {
  files: FileItem[];
  courseId: string;
  coursePrice: number;
};

export default function CourseMaterials({
  files,
  courseId,
  coursePrice,
}: Props) {
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [preview, setPreview] = useState<FileItem | null>(null);

  useEffect(() => {
    // Free course → everyone has access
    if (coursePrice === 0) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    // Paid course → check enrollment
    const token = localStorage.getItem("horizon_token");
    if (!token) {
      setHasAccess(false);
      setChecking(false);
      return;
    }

    fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const enrollment = (d.enrollments || []).find(
          (e: any) => e.course?._id === courseId
        );

        if (
          enrollment &&
          (enrollment.paymentStatus === "paid" ||
            enrollment.paymentStatus === "free")
        ) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
        setChecking(false);
      })
      .catch(() => {
        setHasAccess(false);
        setChecking(false);
      });
  }, [courseId, coursePrice]);

  // No files at all
  if (!files || files.length === 0) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-bold text-xl mb-3">📁 Course Materials</h2>
        <p className="text-gray-500 text-sm">
          No materials uploaded yet. Check back soon!
        </p>
      </div>
    );
  }

  // Still checking access
  if (checking) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-bold text-xl mb-3">📁 Course Materials</h2>
        <p className="text-gray-500 text-sm">Loading materials...</p>
      </div>
    );
  }

  // 🔒 Locked — paid course + not enrolled/paid
  if (!hasAccess) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">📁 Course Materials</h2>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
            🔒 Locked
          </span>
        </div>

        <div className="text-center py-8">
          <div className="text-5xl mb-3">🔒</div>
          <h3 className="font-bold text-lg mb-2">
            Materials Locked
          </h3>
          <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
            Enroll and complete payment to unlock{" "}
            <strong>{files.length}</strong> file
            {files.length > 1 ? "s" : ""} for this course.
          </p>
          <Link
            href={`/courses/${courseId}/payment`}
            className="inline-block bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition"
          >
            Unlock Materials →
          </Link>
        </div>

        {/* Preview of file names (locked) */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-500 mb-3">
            📎 {files.length} file{files.length > 1 ? "s" : ""} available after
            enrollment:
          </p>
          <div className="space-y-2">
            {files.map((f, idx) => (
              <div
                key={f._id || `file-${idx}`}
                className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2.5 opacity-60"
              >
                <span className="text-xl">{getFileIcon(f.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(f.size)}</p>
                </div>
                <span className="text-lg">🔒</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Unlocked — show download/preview
  return (
    <>
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">📁 Course Materials</h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
            ✓ Unlocked
          </span>
        </div>

        <div className="space-y-2">
          {files.map((f, idx) => (
            <div
              key={f._id || `file-${idx}`}
              className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border rounded-xl px-4 py-3 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">
                  {getFileIcon(f.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatSize(f.size)} • {getFileLabel(f.type)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {canPreview(f.type) && (
                  <button
                    onClick={() => setPreview(f)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                  >
                    👁️ Preview
                  </button>
                )}
                <a
                  href={f.url}
                  download={f.name}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition"
                >
                  ⬇️ Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">
                  {preview.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatSize(preview.size)}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-500 hover:text-gray-900 text-2xl ml-4 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center min-h-[300px]">
              {preview.type.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : preview.type === "application/pdf" ? (
                <iframe
                  src={preview.url}
                  className="w-full h-[70vh] rounded-lg"
                  title={preview.name}
                />
              ) : (
                <p className="text-gray-500">Preview not available</p>
              )}
            </div>

            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <a
                href={preview.url}
                download={preview.name}
                className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-semibold transition"
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎥";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("presentation") || type.includes("powerpoint")) return "📊";
  if (type.includes("sheet") || type.includes("excel")) return "📈";
  if (type.includes("zip") || type.includes("rar")) return "📦";
  return "📎";
}

function getFileLabel(type: string) {
  if (type.startsWith("image/")) return "Image";
  if (type.startsWith("video/")) return "Video";
  if (type.startsWith("audio/")) return "Audio";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word") || type.includes("document")) return "Document";
  if (type.includes("presentation") || type.includes("powerpoint")) return "Slides";
  if (type.includes("sheet") || type.includes("excel")) return "Spreadsheet";
  if (type.includes("zip") || type.includes("rar")) return "Archive";
  return "File";
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function canPreview(type: string) {
  return type.startsWith("image/") || type === "application/pdf";
}