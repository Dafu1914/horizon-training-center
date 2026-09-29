"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import NotificationBell from "./NotificationBell";

type Props = {
  title: string;
  subtitle?: string;
  homeHref?: string;
};

export default function DashboardHeader({ title, subtitle, homeHref }: Props) {
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

  const roleBadge = () => {
    if (user?.role === "admin")
      return { label: "Admin", icon: "👑", color: "bg-purple-100 text-purple-800" };
    if (user?.role === "teacher")
      return { label: "Teacher", icon: "👨‍🏫", color: "bg-blue-100 text-blue-800" };
    return { label: "Student", icon: "👨‍🎓", color: "bg-emerald-100 text-emerald-800" };
  };

  const badge = roleBadge();

  const dashboardHref =
    homeHref ||
    (user?.role === "admin"
      ? "/admin"
      : user?.role === "teacher"
      ? "/teacher"
      : "/student");

  return (
    <header className="w-full bg-gray-200 border-b border-gray-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 gap-4">
        {/* Logo — NON-clickable (plain text) */}
        <div className="flex items-center gap-2 flex-shrink-0 select-none">
          <span className="text-2xl">🌅</span>
          <span className="text-xl font-bold text-blue-800">Horizon</span>
        </div>

        {/* Center title — clickable to dashboard */}
        <div className="hidden md:block min-w-0 flex-1 text-center">
          <Link
            href={dashboardHref}
            className="inline-block hover:opacity-80 transition"
          >
            <h1 className="font-semibold text-gray-800 truncate hover:text-blue-800">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-600 truncate">{subtitle}</p>
            )}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user && (
            <span
              className={`hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          )}

          <NotificationBell />

          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={dashboardHref}
                className="text-sm text-gray-700 hover:text-blue-800 font-medium"
              >
                {user.name.split(" ")[0]}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}

          {user && (
            <div className="md:hidden">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Exit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: show clickable title below */}
      <div className="md:hidden px-6 pb-3 border-t border-gray-300">
        <Link href={dashboardHref} className="block mt-2">
          <h1 className="font-semibold text-gray-800 text-sm">{title}</h1>
          {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
        </Link>
      </div>
    </header>
  );
}