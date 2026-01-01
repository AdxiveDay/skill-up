"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  username: string;
  level: number;
};

export default function AddFriendPage() {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function search() {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/user/search?username=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        setUsers([]);
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to search users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addFriend(targetUserId: string) {
    try {
      const res = await fetch("/api/friend/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send request");
        return;
      }

      setUsers(prev => prev.filter(u => u._id !== targetUserId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-[#F1EFF5] min-h-screen w-screen font-medium text-[#333333] xl:pl-[324px] pt-[80px] xl:pt-0">
      <div className="flex flex-col xl:flex-row w-full">
        {/* 1. Navbar (คงเดิม) */}
        <nav className="fixed left-0 top-0 z-50 bg-white w-full h-16 px-6 flex items-center xl:px-0 xl:pl-8 xl:py-2 xl:w-[254px] xl:h-screen xl:block">
          <ul className="flex flex-row items-center justify-between w-full xl:flex-col xl:items-start xl:justify-start xl:w-auto">
            <div onClick={() => router.push("/")} className="hidden xl:block cursor-pointer duration-200 hover:scale-105 transition-transform">
              <img className="w-44 animate-pulse" src="/Skillup.png" />
            </div>
            <div className="flex flex-row gap-6 items-center xl:flex-col xl:gap-8 xl:items-start xl:mt-0">
              <p className="hidden xl:block text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>
              <div onClick={() => router.push("/")} className="flex duration-200 hover:scale-105 transition-transform cursor-pointer gap-2 items-center">
                <img className="w-6" src="/Homenormal.png" />
                <li><a href="/" className="text-sm xl:text-base">Dashboard</a></li>
              </div>
              <div onClick={() => router.push("/lesson")} className="flex duration-200 hover:scale-105 cursor-pointer gap-2 items-center">
                <img className="w-6" src="/lessonpurple.png" />
                <li><a href="/lesson" className="text-sm xl:text-base">Lesson</a></li>
              </div>
              <div className="flex gap-2 items-center">
                <img className="w-6" src="/task.png" />
                <li><a href="/" className="text-sm xl:text-base">Task</a></li>
              </div>
            </div>
            {/* Setting Section */}
            <div className="hidden xl:flex xl:flex-col xl:gap-8 xl:mt-50">
              <p className="text-[#ACACAC] text-[0.8rem]">SETTING</p>
              <div className="flex gap-2">
                <img className="w-6" src="/Setting.png" />
                <li><a href="/">Setting</a></li>
              </div>
              <div className="flex gap-2 duration-200 hover:scale-105 cursor-pointer">
                <img className="w-6" src="/logout.png" />
                <li>
                  <a className="text-[#E94444] cursor-pointer" onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    router.push("/login");
                  }}>Logout</a>
                </li>
              </div>
            </div>
            <div className="xl:hidden flex gap-2 items-center">
              <a className="text-[#E94444] text-sm font-bold" onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
              }}>Logout</a>
            </div>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col w-[90%] md:max-w-[700px] xl:max-w-none xl:w-[90%] h-full mt-10 mx-auto xl:mx-0">

          {/* Header Section: Title + Search Bar
              - ปรับเป็น flex-col ในมือถือ และ flex-row ใน iPad/Laptop
          */}
          <div className="flex flex-col md:flex-row items-start md:items-center w-full xl:pr-15 mb-10 justify-between gap-6 md:gap-0">
            <div className="w-full flex flex-col items-center xl:items-start">
              <h1 className="text-3xl font-semibold">Add Friend</h1>
              <h1 className="mt-2 text-[#CDCDCD]">Find your friends</h1>
            </div>

            <div className="flex gap-3 items-center w-full md:w-auto">
              <input
                placeholder="Search username..."
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && search()}
                className="outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all flex bg-white border-2 border-[#EEE8F8] rounded-full p-2 px-7 w-full md:w-[250px] lg:w-[300px] xl:w-[350px]"
              />
              <button
                onClick={search}
                disabled={loading}
                className="bg-[#8955EF] duration-200 hover:scale-105 text-white text-[0.7rem] px-4 h-10 rounded-full hover:bg-[#7644d9] disabled:bg-[#CDCDCD] transition-all cursor-pointer font-semibold whitespace-nowrap"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>

          {/* User List Section */}
          <div className="flex flex-col items-center mt-4 w-full">
            {users.length === 0 && keyword && !loading && (
              <div className="text-center py-16">
                <p className="text-[#ACACAC] font-medium text-lg">No users found matching "{keyword}"</p>
              </div>
            )}

            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-2xl p-4 w-full mb-4 flex justify-between items-center"
              >
                {/* Profile Info: ปรับขนาดตัวอักษรให้พอดีแต่ละจอ */}
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="relative shrink-0">
                    <img className="rounded-full w-12 h-12 object-cover" src="no-profile.jpg" />
                  </div>

                  <div className="overflow-hidden">
                    <h1 className="font-semibold text-base truncate">{u.username}</h1>
                    <p className="text-xs text-[#ACACAC]">Level {u.level}</p>
                  </div>
                </div>

                <button
                  onClick={() => addFriend(u._id)}
                  className="bg-[#8955EF] text-white cursor-pointer w-8 h-8 duration-200 hover:scale-105 text-[0.5rem] rounded-full hover:bg-[#7644d9] transition-all font-medium whitespace-nowrap ml-4 text-sm active:scale-95"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}