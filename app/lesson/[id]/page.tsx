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
        <div className="bg-[#F1EFF5] pl-[345px] min-h-screen font-medium text-[#333333]">
            <div className="flex justify-between w-full">
                <nav className="fixed left-0 top-0 bg-white h-screen pl-8 py-2 w-[254px]">
                    <ul>
                        <div className="">
                            <img className="w-44 animate-pulse" src="/Skillup.png" />
                        </div>
                        <div className="flex flex-col gap-8">
                            <p className="text-[#ACACAC] text-[0.8rem]">OVERVIEW</p>
                            <div className="flex gap-2">
                                <img className="w-6" src="/Homenormal.png" />
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
                <div className="w-[820px] mt-10">
                    {/* <h1 className="text-2xl font-semibold mb-4">{lesson.title}</h1> */}

                    <iframe
                        src={lesson.pdfUrl}
                        className="w-[100%] h-[90vh] border rounded-xl"
                    />
                </div>
                <div className="w-[220px] mt-30 mr-16">
                    <div className="w-full p-6 py-4 h-[269px] bg-white rounded-2xl">
                        <h1>Writter</h1>
                        <div className="flex flex-col items-center">
                            <img className="w-24 object-cover rounded-full h-24 mt-6 mb-4" src="/no-profile.jpg" />
                            <h1>{lesson.createdBy.username}</h1>
                            <p className="text-[#CDCDCD] text-[0.7rem]">{lesson.bio}</p>
                        </div>
                    </div>
                    <h1 className="p-6 break-words bg-white rounded-2xl mt-4">{lesson.more}</h1>
                </div>
            </div>
        </div>
    );
}
