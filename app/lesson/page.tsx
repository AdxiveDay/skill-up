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
        <nav className="fixed left-0 top-0 bg-white h-screen pl-8 py-2 w-[254px]">
          <ul>
            <div className="">
              <img className="w-44 animate-pulse" src="/Skillup.png" />
            </div>
            <div className="flex flex-col gap-8">
              <p className="text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>
              <div className="flex gap-2">
                <img className="w-6" src="/homenormal.png" />
                <li><a href="/">Dashboard</a></li>
              </div>
              <div className="flex gap-2">
                <img className="w-6" src="/lessonpurple.png" />
                <li><a className="text-[#5E17EB]" href="/lesson">Lesson</a></li>
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
