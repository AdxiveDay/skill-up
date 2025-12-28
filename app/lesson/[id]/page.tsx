"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

type Lesson = {
    _id: string;
    title: string;
    bio: string;
    more: string;
    pdfUrl: string;
    createdBy: {
        username: string;
    };
};

export default function LessonDetailPage() {
    const params = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const router = useRouter()

    useEffect(() => {
        fetch(`/api/lesson/${params.id}`)
            .then((res) => res.json())
            .then((data) => setLesson(data.lesson));
    }, [params.id]);

    if (!lesson) {
        return (
            <div className="bg-[url('/Newppbg.png')] bg-cover bg-center flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <img className="w-30 animate-bounce" src="/Skillup-white.png" />
                    <h1 className="text-white font-semibold">Loading..</h1>
                </div>
            </div>
        );
    };

    return (
        // Wrapper: ใช้ xl:pl-[345px] ตามเดิมเป๊ะๆ เพื่อให้เนื้อหา Laptop ไม่เบี้ยว
        <div className="bg-[#F1EFF5] min-h-screen font-medium text-[#333333] px-4 xl:px-0 xl:pl-[345px]">

            <div className="flex flex-col xl:flex-row justify-between w-full">

                {/* Navbar: 
                - จอ Laptop (xl): fixed, w-[254px], left-0, top-0, h-screen (เหมือนเดิมทุกประการ)
                - จอเล็ก: ย้ายมาด้านบน, h-auto, rounded-b-2xl
            */}
                <nav className="fixed left-0 top-0 z-50 bg-white w-full h-16 px-6 flex items-center xl:px-0 xl:pl-8 xl:py-2 xl:w-[254px] xl:h-screen xl:block">
                    <ul className="flex flex-row items-center justify-between w-full xl:flex-col xl:items-start xl:justify-start xl:w-auto">

                        {/* LOGO: ซ่อนในจอเล็ก (hidden) กลับมาโชว์ใน Laptop (xl:block) */}
                        <div className="hidden xl:block">
                            <img className="w-44 animate-pulse" src="/Skillup.png" />
                        </div>

                        {/* OVERVIEW SECTION: จอเล็กเรียง flex-row / Laptop เรียง flex-col gap-8 เหมือนเดิม */}
                        <div className="flex flex-row gap-6 items-center xl:flex-col xl:gap-8 xl:items-start xl:mt-0">
                            <p className="hidden xl:block text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>

                            <div className="flex gap-2 items-center">
                                <img className="w-6" src="/Homenormal.png" />
                                <li><a href="/" className="text-sm xl:text-base">Dashboard</a></li>
                            </div>

                            <div className="flex gap-2 items-center">
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
                            <div className="flex gap-2">
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

                {/* Content Area: กลับมาใช้ w-[820px] ในจอ Laptop เหมือนเดิม */}
                <div className="w-full xl:w-[820px] mt-24 xl:mt-10">
                    <iframe
                        src={lesson.pdfUrl}
                        className="w-full h-[60vh] xl:h-[90vh] border rounded-xl bg-white"
                    />
                </div>

                {/* Right Sidebar: กลับมาใช้ w-[220px] และ Margin เดิมใน Laptop */}
                <div className="w-full xl:w-[220px] mt-8 mb-8 xl:mb-0 xl:mt-30 xl:mr-16">
                    <div className="w-full p-6 py-4 h-auto xl:h-[269px] bg-white rounded-2xl flex flex-row xl:flex-col justify-between items-center xl:justify-start">
                        <div className="text-left xl:w-full">
                            <h1 className="text-gray-400 xl:text-[#333333]">Writer</h1>
                        </div>

                        <div className="flex flex-row xl:flex-col items-center gap-4 xl:gap-0">
                            <img className="w-16 h-16 xl:w-24 xl:h-24 object-cover rounded-full xl:mt-6 xl:mb-4" src="/no-profile.jpg" />
                            <div className="text-left xl:text-center">
                                <h1 className="font-bold">{lesson.createdBy.username}</h1>
                                <p className="text-[#CDCDCD] text-[0.7rem]">{lesson.bio}</p>
                            </div>
                        </div>
                    </div>
                    {lesson.more && (
                        <h1 className="p-6 break-words bg-white rounded-2xl mt-4 xl:flex hidden text-sm">
                            {lesson.more}
                        </h1>
                    )}
                </div>
            </div>
        </div>
    );
}