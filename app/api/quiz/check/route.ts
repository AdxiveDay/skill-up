import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { quizSetId, answers } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const quizSet = await db.collection("quizzes").findOne({ _id: new ObjectId(quizSetId) });

    if (!quizSet) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // ✅ คำนวณคะแนน
    let correctCount = 0;
    quizSet.questions.forEach((question: any, idx: number) => {
      if (answers[idx] === question.correctAnswerIndex) {
        correctCount++;
      }
    });

    const totalQuestions = quizSet.questions.length;
    const passingScore = Math.ceil(totalQuestions * 0.67); // 2/3
    const passed = correctCount >= passingScore;

    // ✅ เช็คว่าเคยทำมาแล้วหรือไม่
    const existingRecord = await db.collection("quiz_attempts").findOne({
      userId: new ObjectId(payload.userId),
      quizSetId: new ObjectId(quizSetId),
    });

    if (existingRecord && existingRecord.passed) {
      return NextResponse.json({
        success: true,
        correctCount,
        totalQuestions,
        passed,
        message: "Already passed. No EXP reward.",
      });
    }

    // ✅ ถ้าตอบถูกครั้งแรก +100 EXP
    if (passed && (!existingRecord || !existingRecord.passed)) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });

      if (user) {
        let exp = (user.exp || 0) + 100;
        let level = user.level || 1;
        let expMax = user.expMax || 100;

        if (exp >= expMax) {
          exp = exp - expMax;
          level += 1;
          expMax = Math.ceil(expMax * 1.15);
        }

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: { exp, level, expMax },
          }
        );
      }

      // ✅ บันทึกว่าเคยทำแล้ว
      await db.collection("quiz_attempts").updateOne(
        { userId: new ObjectId(payload.userId), quizSetId: new ObjectId(quizSetId) },
        {
          $set: {
            userId: new ObjectId(payload.userId),
            quizSetId: new ObjectId(quizSetId),
            passed: true,
            score: correctCount,
            attemptedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } else if (!passed) {
      // ✅ บันทึก attempt ถ้าไม่ผ่าน
      await db.collection("quiz_attempts").updateOne(
        { userId: new ObjectId(payload.userId), quizSetId: new ObjectId(quizSetId) },
        {
          $set: {
            userId: new ObjectId(payload.userId),
            quizSetId: new ObjectId(quizSetId),
            passed: false,
            score: correctCount,
            attemptedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      correctCount,
      totalQuestions,
      passed,
      reward: passed && (!existingRecord || !existingRecord.passed) ? "+100 EXP" : "No reward",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
