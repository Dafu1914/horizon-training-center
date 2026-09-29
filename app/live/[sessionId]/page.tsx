"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LiveSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("horizon_token");
    if (!authToken) {
      window.location.href = "/login";
      return;
    }

    fetch("/api/livekit/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ roomName: `session-${sessionId}` }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setToken(d.token);
          setUrl(d.url);
          setRole(d.role);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to connect");
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Connecting to live session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">⚠️ Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/">
            <Button variant="white">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            🔴 LIVE
          </div>
          <span className="text-sm text-slate-400">
            Session: {sessionId}
          </span>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
            {role === "teacher" || role === "admin"
              ? "👨‍🏫 Teacher"
              : "👨‍🎓 Student"}
          </span>
        </div>
        <Link href="/student">
          <Button variant="outline" className="border-white text-white">
            Leave
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8" style={{ height: "80vh" }}>
        <LiveKitRoom
          token={token}
          serverUrl={url}
          connect={true}
          video={role === "teacher" || role === "admin"}
          audio={true}
          onDisconnected={() => {
            window.location.href = "/student";
          }}
          data-lk-theme="default"
          style={{ height: "100%", borderRadius: "16px", overflow: "hidden" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}