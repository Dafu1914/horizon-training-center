"use client";

import { useRef, useState } from "react";

type UploadedFile = {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

type Props = {
  courseId: string;
  initialFiles?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
};

export default function FileUploader({
  courseId,
  initialFiles = [],
  onFilesChange,
}: Props) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("courseId", courseId);

    Array.from(fileList).forEach((f) => {
      formData.append("files", f);
    });

    try {
      const token = localStorage.getItem("horizon_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      updateFiles([...files, ...data.files]);
    } catch {
      setError("Network error");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;

    const token = localStorage.getItem("horizon_token");
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, fileId }),
    });

    if (res.ok) {
      updateFiles(files.filter((f) => f._id !== fileId));
    }
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
        }`}
      >
        <div className="text-5xl mb-3">📁</div>
        <p className="font-semibold text-gray-700 mb-1">
          {uploading ? "Uploading..." : "Drop files here or click to browse"}
        </p>
        <p className="text-xs text-gray-500">
          PDF, DOC, PPT, XLS, Video, Audio, Image, ZIP — max 100MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => upload(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.mov,.mp3,.wav,.ogg,.zip,.rar"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mt-3">
          {error}
        </div>
      )}

      {/* Files list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            📎 {files.length} file{files.length > 1 ? "s" : ""} attached
          </p>
{files.map((f, idx) => (
  <div
    key={f._id || `file-${idx}`}
    className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 py-3"
  >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">
                  {getFileIcon(f.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(f.size)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(f._id)}
                className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}