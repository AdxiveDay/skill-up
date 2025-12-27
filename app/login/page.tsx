"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // ✅ เก็บ userId (ชั่วคราวใช้ localStorage)
      localStorage.setItem("userId", data.userId);

      // ไปหน้า dashboard (หรือหน้า lesson)
      router.push("/");
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
            <h1 className="text-4xl font-semibold text-[#8955EF]">Login</h1>
            <img className="w-12" src="/basil_logout-solid.png" />
          </div>
        </div>

        <div className="flex-col flex items-center mt-6">

          <div className="flex flex-col w-full items-center gap-1">
            <div className="w-[80%]">
              <h1 className="text-[#B6B6B6] text-left">Username:</h1>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
            />
          </div>

          <div className="flex flex-col w-full items-center gap-1 mt-2">
            <div className="w-[80%]">
              <h1 className="text-[#B6B6B6] text-left">Password:</h1>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[80%] border-2 border-[#E4DCF4] rounded-md p-1.5 px-1 outline-none focus:ring-2 focus:ring-[#E4DCF4] transition-all"
            />
          </div>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

          <button className="bg-[#8955EF] cursor-pointer hover:scale-103 duration-300 transition-transform flex p-2 px-4 mt-12 text-[0.8rem] items-center gap-4 text-white rounded-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            <div className="bg-white flex justify-center items-center w-6 h-6 rounded-full">
              <img className="w-4" src="/arrow.png" />
            </div>
          </button>
          <div className="flex gap-1 mt-2">
            <h1 className="text-[0.6rem]">Didn't have an account?</h1>
            <h1 className="text-[0.6rem] font-semibold cursor-pointer underline text-[#8955EF]" onClick={() => router.push("/register")}>Register</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
