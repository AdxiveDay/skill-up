"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  imageUrl?: string;
};

interface QuizModalProps {
  quizSet: {
    _id: string;
    questions: Question[];
  };
  onClose: () => void;
  onQuizComplete: () => void;
}

export default function QuizModal({ quizSet, onClose, onQuizComplete }: QuizModalProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quizSet.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = quizSet.questions[currentQuestionIdx];

  const handleSelectAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      alert("กรุณาตอบทุกข้อ");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizSetId: quizSet._id,
          answers: answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to check answers");
        return;
      }

      setResult(data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Quiz Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white w-[90%] max-w-2xl rounded-3xl p-12 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Question {currentQuestionIdx + 1} / {quizSet.questions.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#8955EF] h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIdx + 1) / quizSet.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="question"
                className="w-full h-[200px] object-cover rounded-2xl mb-6"
              />
            )}

            {/* Question */}
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full p-4 rounded-xl cursor-pointer font-semibold transition-all text-left ${
                    answers[currentQuestionIdx] === idx
                      ? "bg-[#8955EF] text-white"
                      : "bg-gray-100 text-[#333333] hover:bg-gray-200"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {option}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                disabled={currentQuestionIdx === 0}
                className="flex-1 cursor-pointer bg-gray-200 hover:scale-105 duration-200 transition-transform text-[#333333] py-3 rounded-xl disabled:bg-gray-100 disabled:text-gray-400 font-semibold"
              >
                ← Previous
              </button>

              {currentQuestionIdx < quizSet.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                  className="flex-1 cursor-pointer bg-[#8955EF] hover:scale-105 duration-200 transition-transform text-white py-3 rounded-xl font-semibold"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-400 cursor-pointer hover:scale-105 duration-200 transition-transform text-white py-3 rounded-xl disabled:bg-gray-400 font-semibold"
                >
                  {loading ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center">
            <div className={`text-4xl mb-4 ${result.passed ? "text-[#8955EF]" : "text-[#fc3f3f]"}`}>
              {result.passed ? "Pass!" : "Failed"}
            </div>
            <p className="text-lg mb-6">
              score: {result.correctCount} / {result.totalQuestions}
            </p>
            <p className={`text-lg font-semibold mb-6 ${result.reward === "No reward" ? "text-[#333333]" : "text-[#8955EF]"}`}>
              {result.reward}
            </p>
            <button
              onClick={() => {
                onQuizComplete();
                onClose();
              }}
              className="w-full bg-[#8955EF] cursor-pointer text-white py-3 rounded-xl hover:scale-105 duration-200 transition-transform font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}