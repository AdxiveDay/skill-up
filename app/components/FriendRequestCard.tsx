"use client";

import { useEffect, useState } from "react";

type FriendRequest = {
  _id: string;
  username: string;
  level: number;
};

interface FriendRequestCardProps {
  onRequestAccepted?: () => void;
}

export default function FriendRequestCard({ onRequestAccepted }: FriendRequestCardProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    // ✅ Poll untuk update setiap 5 detik
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/friend/requests");
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function acceptFriend(requestId: string) {
    try {
      const res = await fetch("/api/friend/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to accept request");
        return;
      }

      // ✅ Remove accepted request from UI
      setRequests((prev) => prev.filter((r) => r._id !== requestId));

      // ✅ Callback เพื่อให้ parent component refresh
      if (onRequestAccepted) {
        onRequestAccepted();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  }

  // ✅ Don't render if no requests
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-4">
      {requests.map((req) => (
        <div
          key={req._id}
          className="bg-white w-72 p-4 rounded-2xl shadow-xl border animate-pulse"
        >
          <h1 className="font-bold">{req.username}</h1>
          <p className="text-sm text-gray-400">Level {req.level}</p>
          <p className="text-xs text-gray-300 mt-1">sent you a friend request</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => acceptFriend(req._id)}
              className="flex-1 bg-[#8955EF] text-white py-2 rounded-full hover:bg-[#7644d9] transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() =>
                setRequests((prev) => prev.filter((r) => r._id !== req._id))
              }
              className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-full hover:bg-gray-300 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}