"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import ExploreMenu from "./ExploreMenu";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("horizon_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("horizon_token");
    localStorage.removeItem("horizon_user");
    window.location.href = "/";
  };

  const dashboardLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "teacher"
      ? "/teacher"
      : "/student";

  return (
    <nav className="w-full border-b border-gray-300 bg-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
        {/* Left: Logo + Explore + Subscribe */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <span className="text-xl font-bold text-blue-800">Horizon</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <ExploreMenu />
            <Link
              href="/subscribe"
              className="text-gray-700 hover:text-blue-800 transition font-medium"
            >
              Subscribe
            </Link>
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        {/* Right: About + Auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/about"
            className="hidden md:block text-gray-700 hover:text-blue-800 transition font-medium"
          >
            About
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link
                href={dashboardLink}
                className="hidden md:block text-sm text-gray-700 hover:text-blue-800 font-medium"
              >
                Hi, {user.name.split(" ")[0]}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="emerald" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pb-3">
        <SearchBar />
      </div>
    </nav>
  );
}