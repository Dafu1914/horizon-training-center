"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Tab = "notifications" | "messages";

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
  body: string;
  fromName: string;
  link: string;
  linkLabel: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export default function InboxPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("notifications");
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const load = () => {
    const token = localStorage.getItem("horizon_token");
    const stored = localStorage.getItem("horizon_user");

    if (!token || !stored) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(stored));

    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("/api/notifications", { headers }).then((r) => r.json()),
      fetch("/api/messages", { headers }).then((r) => r.json()),
    ]).then((results) => {
      const [n, m] = results;
      if (n.status === "fulfilled")
        setNotifications(n.value.notifications || []);
      if (m.status === "fulfilled") setMessages(m.value.messages || []);
      setLoading(false);
    });
  };

  useEffect(() => {
  load();

  // ✅ Auto-mark as read when visiting inbox
  const token = localStorage.getItem("horizon_token");
  if (token) {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.allSettled([
      fetch("/api/notifications", { method: "PATCH", headers }),
      fetch("/api/messages", { method: "PATCH", headers }),
    ]);
  }
}, []);

  const markNotifsRead = async () => {
    const token = localStorage.getItem("horizon_token");
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const markMsgsRead = async () => {
    const token = localStorage.getItem("horizon_token");
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-gray-500">
        Loading inbox...
      </div>
    );
  }

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const unreadMsgs = messages.filter((m) => !m.read).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">📬 Inbox</h1>
      <p className="text-gray-600 mb-8">
        Your notifications and messages in one place.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setTab("notifications")}
          className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
            tab === "notifications"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          🔔 Notifications
          {unreadNotifs > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadNotifs}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("messages")}
          className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
            tab === "messages"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          💬 Messages
          {unreadMsgs > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadMsgs}
            </span>
          )}
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {tab === "notifications" && (
        <div>
          {unreadNotifs > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={markNotifsRead}
                className="text-sm text-blue-700 hover:underline font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-bold mb-2">No notifications</h3>
              <p className="text-gray-600">
                You'll see live class alerts and other updates here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const inner = (
                  <div
                    className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-start gap-4 ${
                      !n.read ? "border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <span className="text-3xl flex-shrink-0">
                      {n.icon || "🔔"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`mb-1 ${
                          !n.read ? "font-bold" : "font-medium"
                        }`}
                      >
                        {n.title}
                      </h3>
                      {n.body && (
                        <p className="text-sm text-gray-600 mb-2">{n.body}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link key={n._id} href={n.link} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div key={n._id}>{inner}</div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MESSAGES */}
      {tab === "messages" && (
        <div>
          {unreadMsgs > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={markMsgsRead}
                className="text-sm text-blue-700 hover:underline font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">No messages</h3>
              <p className="text-gray-600">
                Messages from teachers and Horizon will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm ${
                    !m.read ? "border-l-4 border-l-emerald-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          From: {m.fromName}
                        </span>
                        {m.type && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {m.type}
                          </span>
                        )}
                      </div>
                      <h3
                        className={`mb-1 ${
                          !m.read ? "font-bold" : "font-medium"
                        }`}
                      >
                        {m.subject}
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line mb-3">
                        {m.body}
                      </p>
                      <p className="text-xs text-gray-400">
                        {timeAgo(m.createdAt)}
                      </p>
                    </div>
                  </div>

                  {m.link && (
                    <Link href={m.link}>
                      <Button variant="emerald" size="sm">
                        {m.linkLabel || "Open"} →
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
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
  return new Date(dateStr).toLocaleString();
}