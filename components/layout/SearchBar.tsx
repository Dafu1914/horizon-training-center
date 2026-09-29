"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/courses/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          setResults(d.courses || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search for anything..."
            className="w-full border border-gray-300 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>
      </form>

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No courses match "{query}"
            </div>
          ) : (
            <div>
              {results.map((c) => (
                <Link
                  key={c._id}
                  href={`/courses/${c._id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-0"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-emerald-500 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
                    📚
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {c.category} •{" "}
                      {c.price === 0 ? "Free" : formatPrice(c.price)}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full text-left px-4 py-3 text-sm text-blue-800 font-semibold hover:bg-blue-50 border-t"
              >
                See all results for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}