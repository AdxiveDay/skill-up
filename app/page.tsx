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
    <div className="bg-[#F1EFF5] pl-[360px] min-h-screen font-medium text-[#333333]">
      <div className="flex justify-between w-full">
        <nav className="fixed left-0 top-0 bg-white h-screen pl-8 py-2 w-[254px]">
          <ul>
            <div className="">
              <img className="w-44 animate-pulse" src="/Skillup.png" />
            </div>
            <div className="flex flex-col gap-8">
              <p className="text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>
              <div className="flex gap-2">
                <img className="w-6" src="/homepur.png" />
                <li><a href="/">Dashboard</a></li>
              </div>
              <div className="flex gap-2">
                <img className="w-6" src="/lesson.png" />
                <li><a href="/lesson">Lesson</a></li>
              </div>
              <div className="flex gap-2">
                <img className="w-6" src="/task.png" />
                <li><a href="/">Task</a></li>
              </div>
            </div>
            <div className="flex flex-col gap-8 mt-50">
              <p className="text-[#ACACAC] text-[0.8rem]">SETTING</p>
              <div className="flex gap-2">
                <img className="w-6" src="/Setting.png" />
                <li><a href="/">Setting</a></li>
              </div>
              <div className="flex gap-2">
                <img className="w-6" src="/logout.png" />
                {/* ทำระบบ Logout  */}
                <li><a className="text-[#E94444] cursor-pointer" onClick={async () => {
                  await fetch("/api/logout", { method: "POST" });
                  router.push("/login");
                }}
                >Logout</a></li>
              </div>
            </div>
          </ul>
        </nav>
        <div className="w-[739px] mt-8 flex flex-col items-center">
          {/* search system */}
          <input placeholder="Find your lesson.." type="text" value={searchTerm} className="outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all flex bg-white border-2 border-[#EEE8F8] rounded-full p-3 px-10 w-full" onChange={(e) => setSearchTerm(e.target.value)} />

          <div className="flex mt-10">
            <img src="banner1.png" className="w-full h-[245px]" />
            <img src="Robot.png" className="w-[534px] h-[322px] animate-size-loop absolute ml-[22rem] mt-[-3.5rem]" />
          </div>
          <div className="mt-8 w-full flex flex-col gap-8">
            <h1 className="text-2xl text-left">Continue Learning</h1>

            <div className="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar  mb-8 pb-2">
              {filteredHistory.length === 0 && (
                <p className="text-[#ACACAC] text-sm shrink-0">
                  No recent lessons
                </p>
              )}

              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => router.push(`/lesson/${item.lessonId}`)}
                  className="
          bg-white cursor-pointer
          w-[275px]
          p-4 rounded-2xl
          shrink-0
          hover:scale-[1.02] transition
        "
                >
                  <img
                    src={item.coverUrl}
                    className="w-full h-[120px] object-cover rounded-xl"
                  />
                  <p className="bg-[#E8DCFF] p-1 rounded-md w-[30%] mt-2 mb-3 text-[0.5rem] text-center text-[#A171FF]">{item.type}</p>
                  <h2 className="font-semibold break-words mt-1">{item.title}</h2>
                  <div className="flex mt-4 gap-3 mb-1">
                    <img src="no-profile.jpg" className="w-10 rounded-full" />
                    <div className="flex flex-col">
                      <h1>{item.createdBy.username}</h1>
                      <h1 className="text-[#CDCDCD] text-[0.7rem]">{item.bio}</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="w-[324px] py-8 pl-4 gap-12 flex flex-col">
          <div className="flex gap-2">
            <img className="rounded-full w-10 h-10" src="no-profile.jpg" />
            <div className="">
              <h1 className="text-[#8955EF]">{user.username}</h1>
              <h1 className="text-[#CDCDCD] text-[0.7rem]">Student Plan</h1>
            </div>
          </div>
          <div className="bg-white p-6 py-4 rounded-3xl w-[80%] h-[269px]">
            <h1>Profile</h1>
            <div className="flex flex-col gap-2 my-[1.25rem] items-center">
              <img className="rounded-full w-24 h-24" src="/no-profile.jpg" />
              <div className="flex flex-col w-[100%] items-center">
                <h1>{user.username}</h1>
                <h1 className="text-[#CDCDCD] text-[0.7rem]">Level: {user.level}</h1>
                <div className="w-full mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#8955EF] h-2 rounded-full"
                    style={{ width: `${(user.exp / user.expMax) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 py-4 rounded-3xl w-[80%]">
            <h1 className="mb-8">Friend</h1>
            <div className="flex mt-4 gap-2">
              <img className="rounded-full w-10 h-10" src="no-profile.jpg" />
              <div className="flex flex-col">
                <h1>Kru P. Sprite</h1>
                <h1 className="text-[#CDCDCD] text-[0.7rem]">0</h1>
              </div>
            </div>
            <div className="flex mt-4 gap-2">
              <img className="rounded-full w-10 h-10" src="no-profile.jpg" />
              <div className="flex flex-col">
                <h1>Kru P. Punn</h1>
                <h1 className="text-[#CDCDCD] text-[0.7rem]">0</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
