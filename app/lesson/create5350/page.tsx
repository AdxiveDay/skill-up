"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLessonPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("")
  const [more, setMore] = useState("")
  const [type, setType] = useState("Physics");
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cover || !pdf) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("bio", bio);
    formData.append("more", more);
    formData.append("type", type);
    formData.append("cover", cover);
    formData.append("pdf", pdf);

    setLoading(true);

    const res = await fetch("/api/lesson/create", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/lesson");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1>Create Lesson</h1>

      <input
        placeholder="Title"
        value={title}
        maxLength={48}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="your bio"
        value={bio}
        maxLength={48}
        onChange={(e) => setBio(e.target.value)}
      />

      <input
        placeholder="more experience (if have)"
        value={more}
        maxLength={100}
        onChange={(e) => setMore(e.target.value)}
      />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Physics">Physics</option>
        <option value="Math">Math</option>
        <option value="Bio">Bio</option>
        <option value="Chem">Chem</option>
        <option value="History">History</option>
      </select>

      <div className="flex flex-col">
        <h1>อัปโหลดหน้าปก (กว้าง 260 x สูง 165)</h1>
        <input placeholder="Cover" type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
      </div>

      <div className="flex flex-col">
        <h1>อัปโหลด PDF</h1>
        <input placeholder="PDFfile" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Create"}
      </button>
    </div>
  );
}
