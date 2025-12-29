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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!params.id) return;

        const fetchLesson = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await fetch(`/api/lesson/${params.id}`);
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status}`);
                }
                
                const data = await res.json();
                setLesson(data.lesson);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err instanceof Error ? err.message : "Failed to load lesson");
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [params.id]);

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

    if (error) {
        return (
            <div className="bg-[url('/Newppbg.png')] bg-cover bg-center flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-white font-semibold text-xl">Error</h1>
                    <p className="text-white">{error}</p>
                    <button
                        onClick={() => router.push("/lesson")}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Back to Lessons
                    </button>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="bg-[url('/Newppbg.png')] bg-cover bg-center flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-white font-semibold text-xl">Lesson not found</h1>
                    <button
                        onClick={() => router.push("/lesson")}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Back to Lessons
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F1EFF5] min-h-screen font-medium text-[#333333] px-4 xl:px-0 xl:pl-[345px]">
            <div className="flex flex-col xl:flex-row justify-between w-full">
                {/* Navbar */}
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

                {/* Content Area */}
                <div className="w-full xl:w-[820px] mt-24 xl:mt-10">
                    <iframe
                        src={lesson.pdfUrl}
                        className="w-full h-[60vh] xl:h-[90vh] border rounded-xl bg-white"
                        title="Lesson PDF"
                        allowFullScreen
                    />
                </div>

                {/* Right Sidebar */}
                <div className="w-full xl:w-[220px] mt-8 mb-8 xl:mb-0 xl:mt-30 xl:mr-16">
                    <div className="w-full p-6 py-4 h-auto xl:h-[269px] bg-white rounded-2xl flex flex-row xl:flex-col justify-between items-center xl:justify-start">
                        <div className="text-left xl:w-full">
                            <h1 className="text-gray-400 xl:text-[#333333]">Writter</h1>
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