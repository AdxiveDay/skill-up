"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = {
  _id: string;
  title: string;
};

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  imageUrl: string;
};

export default function CreateQuizPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [quizSets, setQuizSets] = useState<any[]>([]);

  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correctAnswerIndex: 0, imageUrl: "" },
  ]);
  const [loading, setLoading] = useState(false);

  // ✅ ตรวจสอบรหัส
  const handleLogin = () => {
    if (password === "passw0rd") {
      setAuthenticated(true);
      fetchLessons();
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  // ✅ ดึง Lessons
  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lesson/list");
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ ดึง Quiz Sets ของ Lesson ที่เลือก
  const handleLessonChange = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    try {
      const res = await fetch(`/api/quiz/list?lessonId=${lessonId}`);
      const data = await res.json();
      setQuizSets(data.quizzes || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ เพิ่มคำถามใหม่
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswerIndex: 0, imageUrl: "" },
    ]);
  };

  // ✅ ลบคำถาม
  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert("ต้องมีอย่างน้อย 1 คำถาม");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // ✅ สร้าง Quiz Set
  const handleCreateQuizSet = async () => {
    if (!selectedLessonId) {
      alert("กรุณาเลือก Lesson");
      return;
    }

    if (questions.length < 3) {
      alert("ต้องมีอย่างน้อย 3 คำถาม");
      return;
    }

    if (questions.some((q) => !q.question || q.options.some((o) => !o))) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          quizzes: questions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create quiz");
        return;
      }

      alert("สร้าง Quiz Set สำเร็จ!");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0, imageUrl: "" }]);
      handleLessonChange(selectedLessonId);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ลบ Quiz Set
  const handleDeleteQuizSet = async (quizSetId: string) => {
    if (!confirm("ยืนยันการลบ?")) return;

    try {
      const res = await fetch("/api/quiz/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizSetId }),
      });

      if (!res.ok) {
        alert("Failed to delete quiz set");
        return;
      }

      handleLessonChange(selectedLessonId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1EFF5]">
        <div className="bg-white p-8 rounded-3xl w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Quiz</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border-2 border-[#EEE8F8] rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-[#8955EF]"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#8955EF] text-white py-3 rounded-xl hover:bg-[#7644d9] font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1EFF5] min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-8">Create Quiz Set</h1>

        {/* Select Lesson */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Select Lesson</label>
          <select
            value={selectedLessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="w-full border-2 border-[#EEE8F8] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#8955EF]"
          >
            <option value="">-- Choose Lesson --</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        {/* Questions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Questions ({questions.length})</h2>
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Question {qIdx + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <textarea
                  value={q.question}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[qIdx].question = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Enter question"
                  className="w-full border-2 border-[#EEE8F8] rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-[#8955EF]"
                  rows={2}
                />

                {/* Image URL */}
                <input
                  type="text"
                  value={q.imageUrl}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[qIdx].imageUrl = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Image URL (Optional)"
                  className="w-full border-2 border-[#EEE8F8] rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-[#8955EF]"
                />

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {q.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswerIndex === oIdx}
                        onChange={() => {
                          const newQuestions = [...questions];
                          newQuestions[qIdx].correctAnswerIndex = oIdx;
                          setQuestions(newQuestions);
                        }}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[qIdx].options[oIdx] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        placeholder={`Option ${oIdx + 1}`}
                        className="flex-1 border-2 border-[#EEE8F8] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#8955EF]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            onClick={addQuestion}
            className="mt-4 bg-gray-200 text-[#333333] px-6 py-3 rounded-xl hover:bg-gray-300 font-semibold"
          >
            + Add Question
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateQuizSet}
          disabled={loading}
          className="w-full bg-[#8955EF] text-white py-3 rounded-xl hover:bg-[#7644d9] disabled:bg-gray-400 font-semibold mb-8"
        >
          {loading ? "Creating..." : "Create Quiz Set"}
        </button>

        {/* Quiz Sets List */}
        {selectedLessonId && (
          <div>
            <h2 className="text-xl font-bold mb-4">Quiz Sets ({quizSets.length})</h2>
            <div className="space-y-3">
              {quizSets.map((quizSet) => (
                <div key={quizSet._id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{quizSet.questions?.length || 0} questions</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(quizSet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuizSet(quizSet._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
