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
    <div className="bg-[#F1EFF5] min-h-screen font-medium text-[#333333] xl:pl-[324px] pt-[80px] xl:pt-0">
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

        {/* 2. Content Section
          - iPad (md): mx-auto และ max-w จะทำให้มันอยู่ตรงกลางพอดี
          - Laptop (xl): mx-0 และ w-[1200px] กลับไปที่เดิม
      */}
        <div className="w-full max-w-full md:max-w-[700px] lg:max-w-[900px] xl:max-w-none xl:w-[1200px] mt-8 flex flex-col items-center md:mx-auto xl:mx-0 xl:items-start">

          {/* Header: Title + Search 
            - แก้ไขปุ่ม Search ไม่ให้ชิดขอบ Laptop เกินไปโดยใช้ xl:pr-24 ตามโค้ดเดิมคุณ
        */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between w-[90%] xl:w-full xl:pr-30 items-center">
            <h1 className="font-semibold text-3xl">Lessons</h1>
            <input
              placeholder="Find your lesson.."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all flex bg-white border-2 border-[#EEE8F8] rounded-full p-2 px-7 w-full md:w-[300px] xl:w-[35%]"
            />
          </div>

          {/* Category Selector */}
          <div className="w-[90%] xl:w-full flex justify-start">
            <select
              className="mt-4 text-[0.7rem] mb-10 bg-[#E8DCFF] outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all rounded-md p-1"
              onChange={(e) => setType(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Physics">Physics</option>
              <option value="Math">Math</option>
              <option value="Bio">Biology</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          {/* Grid Lessons
            - ใช้ justify-center ใน md เพื่อให้การ์ดอยู่กลางหน้าจอ iPad
        */}
          <div className="w-full flex justify-center xl:justify-start">
            <div className="w-[90%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 mb-12">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson._id}
                  onClick={() => router.push(`/lesson/${lesson._id}`)}
                  className="bg-white cursor-pointer hover:scale-105 transition-transform duration-200 flex flex-col w-full max-w-[345px] p-6 pb-8 h-auto min-h-[339px] rounded-3xl mx-auto xl:mx-0"
                >
                  <img src={lesson.coverUrl} className="w-full object-cover h-[165px] rounded-2xl" />
                  <h1 className="bg-[#E8DCFF] p-1 rounded-md w-[30%] mt-2 mb-3 text-[0.5rem] text-center text-[#A171FF]">{lesson.type}</h1>
                  <h1 className="break-words font-semibold text-lg">{lesson.title}</h1>
                  <div className="flex mt-auto pt-4 gap-3">
                    <img src="no-profile.jpg" className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col">
                      <h1 className="text-sm font-bold">{lesson.createdBy.username}</h1>
                      <h1 className="text-[#CDCDCD] text-[0.7rem] line-clamp-1">{lesson.bio}</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredLessons.length === 0 && <p className="text-[#ACACAC] mt-10">No lessons found</p>}
        </div>
      </div>
    </div>
  );
}
