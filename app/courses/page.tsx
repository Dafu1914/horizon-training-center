"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CourseCard from "@/components/course/CourseCard";

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  thumbnail?: string;
  createdAt?: string;
};

function CoursesContent() {
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [level, setLevel] = useState("All");
  const [price, setPrice] = useState<"All" | "Free" | "Paid">(
    (searchParams.get("price") as any) || "All"
  );
  const [sort, setSort] = useState<
    "Newest" | "PriceLow" | "PriceHigh" | "Popular"
  >("Newest");

  // Sync with URL changes
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "All");
    const p = searchParams.get("price");
    if (p === "Free" || p === "Paid") setPrice(p);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    let list = [...courses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter((c) => c.category === category);
    if (level !== "All") list = list.filter((c) => c.level === level);
    if (price === "Free") list = list.filter((c) => c.price === 0);
    else if (price === "Paid") list = list.filter((c) => c.price > 0);

    if (sort === "PriceLow") list.sort((a, b) => a.price - b.price);
    else if (sort === "PriceHigh") list.sort((a, b) => b.price - a.price);
    else if (sort === "Newest") {
      list.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    }

    return list;
  }, [courses, search, category, level, price, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    level !== "All" ||
    price !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
    setPrice("All");
    setSort("Newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">All Courses</h1>
      <p className="text-gray-600 mb-8">
        Browse our live training programs.
      </p>

      <div className="bg-white border rounded-2xl p-5 mb-8 shadow-sm">
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title, description, or category..."
            className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Price
            </label>
            <select
              value={price}
              onChange={(e) =>
                setPrice(e.target.value as "All" | "Free" | "Paid")
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Newest">Newest First</option>
              <option value="PriceLow">Price: Low → High</option>
              <option value="PriceHigh">Price: High → Low</option>
              <option value="Popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong className="text-blue-800">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "course" : "courses"} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-700 hover:underline font-medium"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold mb-2">No courses yet</h2>
          <p className="text-gray-600">
            Teachers haven't published any courses yet. Check back soon!
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">No matching courses</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-700 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CourseCard
              key={c._id}
              id={c._id}
              title={c.title}
              description={c.description}
              price={c.price}
              category={c.category}
              thumbnail={c.thumbnail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-500">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}