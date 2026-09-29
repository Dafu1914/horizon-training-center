"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Math", icon: "🔢" },
  { name: "Science", icon: "🔬" },
  { name: "Language", icon: "🗣️" },
  { name: "Tech", icon: "💻" },
  { name: "Business", icon: "💼" },
  { name: "Art", icon: "🎨" },
  { name: "General", icon: "📚" },
];

export default function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-700 hover:text-blue-800 transition font-medium flex items-center gap-1 py-2"
      >
        Explore
        <span
          className={`text-xs transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-2xl shadow-2xl z-50 w-72 overflow-hidden">
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-800 transition"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Filter by Price
            </p>
            <div className="flex gap-2">
              <Link
                href="/courses?price=Free"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
              >
                🎁 Free
              </Link>
              <Link
                href="/courses?price=Paid"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
              >
                💰 Paid
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-2 border-t">
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-800 hover:underline"
            >
              Browse all courses →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}