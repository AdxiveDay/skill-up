"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  username: string;
  email: string;

  level: number;
  exp: number;
  expMax: number;

  createdAt: string;
};

type HistoryItem = {
  _id: string;
  lessonId: string;
  title: string;
  bio: string;
  coverUrl: string;
  pdfUrl: string;
  type: string;
  lastViewedAt: string;
  createdBy: {
    username: string;
  };
};



export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const res = await fetch("/api/history", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.createdBy.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetch("/api/exp/tick", { method: "POST" });
      await fetchMe(); // ✅ สำคัญมาก
    }, 60000); // 1 นาที

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) {
          // ❌ ยังไม่ login → ไปหน้า login
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-[url('/Newppbg.png')] bg-cover bg-center flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <img className="w-30 animate-bounce" src="/Skillup-white.png" />
          <h1 className="text-white font-semibold">Loading..</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-[#F1EFF5] min-h-screen font-medium text-[#333333] xl:pl-[360px] pt-[80px] xl:pt-0">
      <div className="flex flex-col md:flex-row justify-between w-full">

        {/* 1. Navbar (Top on Mobile/iPad, Left on Laptop) */}
        <nav className="fixed left-0 top-0 z-50 bg-white w-full h-16 px-6 flex items-center xl:px-0 xl:pl-8 xl:py-2 xl:w-[254px] xl:h-screen xl:block">
          <ul className="flex flex-row items-center justify-between w-full xl:flex-col xl:items-start xl:justify-start xl:w-auto">
            <div onClick={() => router.push("/")} className="hidden xl:block cursor-pointer duration-200 hover:scale-105 transition-transform">
              <img className="w-44 animate-pulse" src="/Skillup.png" />
            </div>
            <div className="flex flex-row gap-6 items-center xl:flex-col xl:gap-8 xl:items-start xl:mt-0">
              <p className="hidden xl:block text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>
              <div onClick={() => router.push("/")} className="flex duration-200 hover:scale-105 transition-transform cursor-pointer gap-2 items-center">
                <img className="w-6" src="/homepur.png" />
                <li><a href="/" className="text-sm xl:text-base">Dashboard</a></li>
              </div>
              <div onClick={() => router.push("/lesson")} className="flex duration-200 hover:scale-105 cursor-pointer gap-2 items-center">
                <img className="w-6" src="/lesson.png" />
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

        {/* 2. Middle Content (Banner ซ้าย) */}
        <div className="w-full px-4 md:w-[65%] md:ml-5 xl:w-[739px] mt-8 flex flex-col items-center">
          <input
            placeholder="Find your lesson.."
            type="text"
            value={searchTerm}
            className="outline-none focus:ring-2 focus:ring-[#E4DCF4] flex bg-white border-2 border-[#EEE8F8] rounded-full p-3 px-10 w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex mt-10 relative w-full h-auto">
            <img src="banner1.png" className="w-full h-auto xl:h-[245px] rounded-3xl" />
            <img
              src="Robot.png"
              className="absolute animate-size-loop w-[70%] max-w-[534px] left-[45%] top-[-15%] xl:w-[534px] xl:h-[322px] xl:ml-[22rem] xl:mt-[-3.5rem] xl:left-0 xl:top-0"
            />
          </div>

          <div className="mt-8 w-full flex flex-col gap-8">
            <h1 className="text-2xl text-left font-semibold">Continue Learning</h1>
            <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 md:overflow-x-auto no-scrollbar mb-8 pb-2">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => router.push(`/lesson/${item.lessonId}`)} // ✅ กู้คืนระบบ Link
                  className="bg-white cursor-pointer hover:scale-105 transition-transform duration-200 w-full md:w-[275px] p-4 rounded-2xl shrink-0"
                >
                  <img src={item.coverUrl} className="w-full h-[120px] object-cover rounded-xl" />
                  <p className="bg-[#E8DCFF] p-1 rounded-md w-[30%] mt-2 mb-3 text-[0.5rem] text-center text-[#A171FF]">{item.type}</p>
                  <h2 className="font-semibold mt-1 line-clamp-1">{item.title}</h2>
                  <div className="flex mt-4 gap-3">
                    <img src="no-profile.jpg" className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col text-[0.7rem]">
                      <h1>{item.createdBy.username}</h1>
                      <h1 className="text-[#CDCDCD]">{item.bio}</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar (Profile ขวา) */}
        <div className="w-full md:w-[30%] xl:w-[324px] py-8 px-4 md:items-start xl:items-start xl:pl-4 gap-12 flex flex-col">
          <div className="flex gap-2">
            <img className="rounded-full w-10 h-10" src="no-profile.jpg" />
            <div>
              <h1 className="text-[#8955EF]">{user.username}</h1>
              <h1 className="text-[#CDCDCD] text-[0.7rem]">Student Plan</h1>
            </div>
          </div>

          {/* กู้คืนระบบ Level & EXP */}
          <div className="bg-white p-6 py-4 rounded-3xl w-full xl:w-[80%]">
            <h1>Profile</h1>
            <div className="flex flex-col gap-2 my-[1.25rem] items-center text-center">
              <img className="rounded-full w-24 h-24" src="/no-profile.jpg" />
              <div className="flex flex-col w-full items-center">
                <h1 className="truncate w-full font-bold">{user.username}</h1>
                <h1 className="text-[#CDCDCD] text-[0.7rem]">Level: {user.level}</h1> {/* ✅ กลับมาแล้ว */}
                <div className="w-full mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#8955EF] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(user.exp / user.expMax) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 py-4 rounded-3xl w-full xl:w-[80%]">
            <h1 className="mb-4 font-bold">Friend</h1>
            {/* รายชื่อเพื่อน... */}
            <div className="flex mt-4 gap-2">
              <img className="rounded-full w-10 h-10" src="no-profile.jpg" />
              <div className="flex flex-col">
                <h1 className="text-sm">Kru P. Sprite</h1>
                <h1 className="text-[#CDCDCD] text-[0.7rem]">0</h1>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
