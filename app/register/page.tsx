"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");

        // ✅ Front-end validation
        if (!username || !email || !password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Password does not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Register failed");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                setError("Please enter a valid email");
                return;
            }

            // ✅ สมัครสำเร็จ
            router.push("/login");
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[url('/Newppbg.png')] bg-cover bg-center flex justify-center items-center h-screen">
            <div className="bg-white rounded-3xl w-[414px] h-[535px]">

                <div className="flex pt-10 flex-col gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-4xl font-semibold text-[#8955EF]">Register</h1>
                        <img className="w-9" src="/solar_pen-2-bold.png" />
                    </div>
                    <h1 className="text-[#B6B6B6] text-[0.8rem]">Sharpen your skills, sharpen your future</h1>
                </div>

                <div className="flex-col flex items-center mt-6">
                    <div className="flex flex-col w-full items-center gap-1">
                        <div className="w-[80%]">
                            <h1 className="text-[#B6B6B6] text-left">Email:</h1>
                        </div>
                        <input
                            type="email"              // ✅ email ต้องเป็น type=email
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
                        />
                    </div>

                    <div className="flex flex-col w-full items-center gap-1">
                        <div className="w-[80%]">
                            <h1 className="text-[#B6B6B6] text-left">Username:</h1>
                        </div>
                        <input
                            type="text"
                            maxLength={20}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
                        />
                    </div>

                    <div className="flex flex-col w-full items-center gap-1">
                        <div className="w-[80%]">
                            <h1 className="text-[#B6B6B6] text-left">Password:</h1>
                        </div>
                        <input
                            type="password"           // ✅ password ถึงจะ censor
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
                        />
                    </div>

                    <div className="flex flex-col w-full items-center gap-1">
                        <div className="w-[80%]">
                            <h1 className="text-[#B6B6B6] text-left">Confirm Password:</h1>
                        </div>
                        <input
                            type="password"           // ✅ confirm password
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
                        />
                    </div>

                    {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

                    <button className="bg-[#8955EF] cursor-pointer hover:scale-103 duration-300 transition-transform flex p-2 px-3 mt-8 text-[0.8rem] items-center gap-2 text-white rounded-full" onClick={handleRegister} disabled={loading}>
                        {loading ? "Registering..." : "Confirm Register"}
                        <div className="bg-white flex justify-center items-center w-6 h-6 rounded-full">
                            <img className="w-4" src="/arrow.png" />
                        </div>
                    </button>
                    <div className="flex gap-1 mt-2">
                        <h1 className="text-[0.6rem]">Already have an account?</h1>
                        <h1 className="text-[0.6rem] font-semibold cursor-pointer underline text-[#8955EF]" onClick={() => router.push("/login")}>Login</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
