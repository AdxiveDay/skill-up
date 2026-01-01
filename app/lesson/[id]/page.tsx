"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import QuizModal from "@/app/components/QuizModal"

type Lesson = {
    _id: string;
    title: string;
    bio: string;
    more: string;
    pdfUrl: string;
    coverUrl: string;
    visitCount: number;
    likeCount: number;
    isLiked: boolean;
    createdBy: { username: string };
};

export default function LessonDetailPage() {
    const params = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizSet, setQuizSet] = useState<any>(null);

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

                // ✅ ดึง Quiz Set
                const quizRes = await fetch(`/api/quiz/list?lessonId=${params.id}`);
                const quizData = await quizRes.json();
                if (quizData.quizzes && quizData.quizzes.length > 0) {
                    setQuizSet(quizData.quizzes[0]);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err instanceof Error ? err.message : "Failed to load lesson");
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [params.id]);

    const handleLike = async () => {
        if (!lesson) return;

        try {
            const res = await fetch("/api/lesson/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId: lesson._id }),
            });

            // ✅ 1. ถ้า Server ตอบกลับไม่สำเร็จ (เช่น 401, 500)
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Like failed");
            }

            const data = await res.json(); // รับ { liked: true/false }

            // ✅ 2. อัปเดต UI ทันที
            setLesson(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isLiked: data.liked,
                    likeCount: data.liked ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1)
                };
            });

        } catch (err: any) {
            console.error("Like Error Details:", err.message);

            // ✅ 3. แจ้งเตือนผู้ใช้ (เช่น ถ้า Token หมดอายุ)
            if (err.message === "Unauthorized") {
                alert("กรุณาเข้าสู่ระบบก่อนกด Like ครับ");
                router.push("/login");
            } else {
                alert("ขออภัย ระบบ Like มีปัญหาชั่วคราว");
            }
        }
    };

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
            
            {showQuiz && quizSet && (
                    <QuizModal
                        quizSet={quizSet}
                        onClose={() => setShowQuiz(false)}
                        onQuizComplete={() => { }}
                    />
                )}
            
            <div className="flex flex-col xl:flex-row justify-between w-full">

                {/* Quiz ขึ้นเป็น Component แบบ fixed ลอย และเมื่อ Quiz ขึ้น ให้ตรงนี้ ให้มี bg อีกชั้นนึงเป็นสีดำ Opacity 50% เหมือนให้ filter พื้นหลังดำๆไว้ */}

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
                <div className="w-full xl:w-[220px] mt-8 mb-8 xl:mb-0 xl:mt-20 xl:mr-16">
                    <img className="w-full h-[130px] object-cover border-white border-4 rounded-2xl mb-6" src={lesson.coverUrl} />

                    {/* สถิติและปุ่ม Like */}
                    <div className="flex gap-2 mb-4 h-16">
                        {/* กล่องยอดวิล */}
                        <div className="flex-1 bg-white rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                            <span className="text-[10px] text-[#CDCDCD] uppercase font-bold">Visits</span>
                            <span className="text-lg font-black text-[#A171FF]">{(lesson.visitCount || 0).toLocaleString()}</span>
                        </div>

                        {/* ปุ่ม Like */}
                        <button
                            onClick={handleLike}
                            className={`flex-1 rounded-2xl flex flex-col items-center hover:scale-105 duration-200 cursor-pointer justify-center transition-all active:scale-90 border ${lesson.isLiked
                                ? 'bg-pink-50 border-pink-200 text-pink-500'
                                : 'bg-white border-gray-100 text-[#CDCDCD] hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex gap-2 items-center">
                                <img className="w-8 h-8" src="/LIKE.png" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold">{lesson.isLiked ? 'Liked' : 'Like'}</span>
                                    <span className="text-lg font-black">{lesson.likeCount || 0}</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* ข้อมูลผู้เขียน */}
                    <div className="w-full p-6 py-5 bg-white rounded-2xl flex flex-col items-center border border-gray-100">
                        <p className="w-full text-left text-[#333333] font-semibold mb-4 uppercase tracking-wider">Writer</p>
                        <img className="w-20 h-20 object-cover rounded-full border-4 border-purple-50 mb-3" src="/no-profile.jpg" />
                        <h1 className="font-semibold text-[#333333] text-base">{lesson.createdBy.username}</h1>
                        <p className="text-[#CDCDCD] text-[0.7rem] text-center mt-1 leading-relaxed">{lesson.bio}</p>
                    </div>

                    {quizSet && (
                        <button
                            onClick={() => setShowQuiz(true)}
                            className="w-full bg-[#8955EF] text-white py-3 rounded-3xl cursor-pointer duration-200 hover:scale-105 transition-transform font-semibold mt-6"
                        >
                            Take Quiz ({quizSet.questions?.length || 0} questions)
                        </button>
                    )}


                </div>
            </div>
        </div>
    );
}