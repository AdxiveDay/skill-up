"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = {
  _id: string;
  title: string;
  bio: string;
  type: string;
  coverUrl: string;
  pdfUrl: string;
  createdBy: {
    username: string;
  };
};

export default function LessonPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [type, setType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter()

  useEffect(() => {
    const url = type ? `/api/lesson/list?type=${type}` : "/api/lesson/list";

    fetch(url)
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons));
  }, [type]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.createdBy.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#F1EFF5] pl-[324px] min-h-screen font-medium text-[#333333]">
      <div className="flex justify-between w-full">
        <nav className="fixed left-0 top-0 z-50 bg-white w-full h-16 px-6 flex items-center xl:px-0 xl:pl-8 xl:py-2 xl:w-[254px] xl:h-screen xl:block">
          <ul className="flex flex-row items-center justify-between w-full xl:flex-col xl:items-start xl:justify-start xl:w-auto">

            {/* LOGO: ซ่อนในจอเล็ก (hidden) กลับมาโชว์ใน Laptop (xl:block) */}
            <div className="hidden xl:block">
              <img className="w-44 animate-pulse" src="/Skillup.png" />
            </div>

            {/* OVERVIEW SECTION: จอเล็กเรียง flex-row / Laptop เรียง flex-col gap-8 เหมือนเดิม */}
            <div className="flex flex-row gap-6 items-center xl:flex-col xl:gap-8 xl:items-start xl:mt-0">
              <p className="hidden xl:block text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>

              <div onClick={() => router.push("/")} className="flex cursor-pointer gap-2 items-center">
                <img className="w-6" src="/Homenormal.png" />
                <li><a href="/" className="text-sm xl:text-base">Dashboard</a></li>
              </div>

              <div onClick={() => router.push("/lesson")} className="flex cursor-pointer gap-2 items-center">
                <img className="w-6" src="/lessonpurple.png" />
                <li><a href="/lesson" className="text-sm xl:text-base">Lesson</a></li>
              </div>

              <div className="flex gap-2 items-center">
                <img className="w-6" src="/task.png" />
                <li><a href="/" className="text-sm xl:text-base">Task</a></li>
              </div>
            </div>

            {/* SETTING SECTION: Hidden ใน iPad/Phone ตามที่ตกลงกัน และกลับมาใน Laptop */}
            <div className="hidden xl:flex xl:flex-col xl:gap-8 xl:mt-50">
              <p className="text-[#ACACAC] text-[0.8rem]">SETTING</p>
              <div className="flex gap-2">
                <img className="w-6" src="/Setting.png" />
                <li><a href="/">Setting</a></li>
              </div>
              <div className="flex gap-2 cursor-pointer">
                <img className="w-6" src="/logout.png" />
                <li>
                  <a className="text-[#E94444] cursor-pointer" onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    router.push("/login");
                  }}>Logout</a>
                </li>
              </div>
            </div>

            {/* ปุ่ม Logout สำหรับจอเล็ก (เพราะ Setting โดนซ่อนไป) */}
            <div className="xl:hidden flex gap-2 items-center">
              <a className="text-[#E94444] text-sm font-bold" onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
              }}>Logout</a>
            </div>
          </ul>
        </nav>
        <div className="w-[1200px] mt-8">
          <div className="flex justify-between mr-24">
            <h1 className="font-semibold text-3xl">Lessons</h1>
            <input placeholder="Find your lesson.." type="text" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all flex bg-white border-2 border-[#EEE8F8] rounded-full p-3 px-10 w-[30%]" />
          </div>

          <select className="mt-4 text-[0.7rem] mb-10 bg-[#E8DCFF] outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all rounded-md p-1" onChange={(e) => setType(e.target.value)}>
            <option value="All">All</option>
            <option value="Physics">Physics</option>
            <option value="Math">Math</option>
            <option value="Bio">Biology</option>
            <option value="Chemistry">Chemistry</option>
          </select>

          <div className=" w-[90%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            {filteredLessons.map((lesson) => (
              <div key={lesson._id} onClick={() => router.push(`/lesson/${lesson._id}`)} className="bg-white cursor-pointer hover:scale-105 transition-transform duration-200 flex flex-col w-[345px] p-6 pb-85 h-[339px] rounded-3xl">
                <img src={lesson.coverUrl} className="w-[298px] object-cover h-[165px] rounded-2xl" />
                <h1 className="bg-[#E8DCFF] p-1 rounded-md w-[30%] mt-2 mb-3 text-[0.5rem] text-center text-[#A171FF]">{lesson.type}</h1>
                <h1 className="break-words">{lesson.title}</h1>
                <div className="flex mt-4 gap-3">
                  <img src="no-profile.jpg" className="w-10 rounded-full" />
                  <div className="flex flex-col">
                    <h1>{lesson.createdBy.username}</h1>
                    <h1 className="text-[#CDCDCD] text-[0.7rem]">{lesson.bio}</h1>
                  </div>
                </div>
              </div>
            ))}
            {filteredLessons.length === 0 && <p className="text-[#ACACAC]">No lessons found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
