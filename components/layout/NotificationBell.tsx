"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = {
  _id: string;
  title: string;
  body: string;
  link: string;
  icon: string;
  read: boolean;
  createdAt: string;
};

type Message = {
  _id: string;
  subject: string;
  fromName: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [user, setUser] = useState<any>(null);

  const totalUnread = unreadNotifs + unreadMsgs;

  const loadData = () => {
    const token = localStorage.getItem("horizon_token");
    const stored = localStorage.getItem("horizon_user");

    if (!token || !stored) {
      setUser(null);
      return;
    }

    setUser(JSON.parse(stored));

    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("/api/notifications", { headers }).then((r) => r.json()),
      fetch("/api/messages", { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [n, m] = results;
      if (n.status === "fulfilled") {
        setNotifications(n.value.notifications || []);
        setUnreadNotifs(n.value.unreadCount || 0);
      }
      if (m.status === "fulfilled") {
        setMessages(m.value.messages || []);
        setUnreadMsgs(m.value.unreadCount || 0);
      }
    });
  };

  // ✅ Mark all as read when dropdown opens
  const markAllAsRead = async () => {
    const token = localStorage.getItem("horizon_token");
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Fire both in parallel — no need to wait
    Promise.allSettled([
      fetch("/api/notifications", { method: "PATCH", headers }),
      fetch("/api/messages", { method: "PATCH", headers }),
    ]).then(() => {
      // Update local state immediately
      setUnreadNotifs(0);
      setUnreadMsgs(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpen = !open;
    setOpen(newOpen);

    // ✅ When opening dropdown, mark everything as read
    if (newOpen && totalUnread > 0) {
      markAllAsRead();
    }
  };

  if (!user) return null;

  const recent = [
    ...notifications.slice(0, 5).map((n) => ({
      type: "notification" as const,
      icon: n.icon || "🔔",
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
    })),
    ...messages.slice(0, 3).map((m) => ({
      type: "message" as const,
      icon: "💬",
      title: m.subject,
      body: `From: ${m.fromName}`,
      link: m.link,
      read: m.read,
      createdAt: m.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-bold text-sm">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div>
                {recent.map((item, idx) => {
                  const inner = (
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-0">
                      <span className="text-2xl flex-shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.title}
                        </p>
                        {item.body && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                            {item.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );

                  return item.link ? (
                    <Link
                      key={`${item.type}-${idx}`}
                      href={item.link}
                      onClick={() => setOpen(false)}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={`${item.type}-${idx}`}>{inner}</div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t bg-gray-50">
            <Link
              href="/inbox"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-blue-800 hover:bg-blue-100 py-3 transition"
            >
              View all in Inbox →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}