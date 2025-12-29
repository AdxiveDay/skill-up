"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLessonPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState("Physics");
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // เช็คข้อมูลเบื้องต้น
    if (!title || !cover || !pdf) {
      alert("กรุณากรอกชื่อบทเรียนและอัปโหลดไฟล์ให้ครบครับ");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("bio", bio);
    formData.append("type", type);
    formData.append("cover", cover);
    formData.append("pdf", pdf);

    setLoading(true);

    try {
      const res = await fetch("/api/lesson/create", {
        method: "POST",
        body: formData, // ห้ามใส่ Header Content-Type เอง เดี๋ยว Browser จัดการให้
      });

      const data = await res.json();

      if (res.ok) {
        alert("สร้างบทเรียนสำเร็จ!");
        router.push("/lesson");
        router.refresh(); // บังคับให้หน้า lesson อัปเดตข้อมูลใหม่
      } else {
        alert(data.error || "เกิดข้อผิดพลาดบางอย่าง");
      }
    } catch (err) {
      console.error(err);
      alert("เชื่อมต่อ Server ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Create New Lesson</h1>

      <div className="flex flex-col gap-2 w-full max-w-md">
        <label className="font-semibold">Title</label>
        <input
          className="border p-2 rounded-md"
          placeholder="Title (max 48 chars)"
          value={title}
          maxLength={48}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        <label className="font-semibold">Your Bio</label>
        <input
          className="border p-2 rounded-md"
          placeholder="your bio"
          value={bio}
          maxLength={48}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        <label className="font-semibold">Category</label>
        <select className="border p-2 rounded-md" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Physics">Physics</option>
          <option value="Math">Math</option>
          <option value="Bio">Bio</option>
          <option value="Chem">Chem</option>
          <option value="History">History</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md bg-white p-4 rounded-lg border shadow-sm">
        <h1 className="font-bold">อัปโหลดหน้าปก</h1>
        <p className="text-xs text-gray-500 mb-2">(แนะนำ กว้าง 260 x สูง 165)</p>
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md bg-white p-4 rounded-lg border shadow-sm">
        <h1 className="font-bold">อัปโหลดไฟล์ PDF</h1>
        <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className={`w-full max-w-md p-3 rounded-full text-white font-bold transition-all ${loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {loading ? "Uploading to Cloudinary..." : "Create Lesson"}
      </button>
    </div>
  );
}