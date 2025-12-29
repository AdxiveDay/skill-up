import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const client = await clientPromise;
    const db = client.db();
    const lessonId = new ObjectId(id);

    /* ================= 1. VISIT COUNT LOGIC ================= */
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // เช็คว่า User คนนี้เพิ่งดูบทเรียนนี้ไปภายใน 1 นาทีที่ผ่านมาหรือไม่
    const recentView = await db.collection("history").findOne({
      userId: new ObjectId(payload.userId),
      lessonId: lessonId,
      lastViewedAt: { $gte: oneMinuteAgo }
    });

    let lessonData;

    if (!recentView) {
      // ถ้ายังไม่เคยดู หรือดูเกิน 1 นาทีแล้ว -> เพิ่มยอด Visit (+1)
      const result = await db.collection("lessons").findOneAndUpdate(
        { _id: lessonId },
        { $inc: { visitCount: 1 } },
        { returnDocument: "after" } // ดึงข้อมูลหลังอัปเดต
      );
      // รองรับทั้ง MongoDB Driver เวอร์ชั่นเก่าและใหม่
      lessonData = result?.value || result;
    } else {
      // ถ้าเพิ่งดูไป -> ดึงข้อมูลปกติ ไม่ต้องบวกเพิ่ม
      lessonData = await db.collection("lessons").findOne({ _id: lessonId });
    }

    if (!lessonData) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    /* ================= 2. LIKE & DATA PREPARATION ================= */
    // ดึงอาเรย์ likes ออกมา (ถ้าไม่มีให้เป็นอาเรย์ว่าง)
    const likesArray = Array.isArray(lessonData.likes) ? lessonData.likes : [];
    
    // เช็คสถานะ Like โดยเปรียบเทียบ ID เป็น String
    const isLiked = likesArray.some(
      (uId: any) => uId.toString() === payload.userId.toString()
    );

    const lesson = {
      ...lessonData,
      visitCount: lessonData.visitCount ?? 0,
      likeCount: likesArray.length,
      isLiked: isLiked,
    };

    /* ================= 3. SAVE/UPDATE HISTORY ================= */
    await db.collection("history").updateOne(
      {
        userId: new ObjectId(payload.userId),
        lessonId: lessonId,
      },
      {
        $set: {
          userId: new ObjectId(payload.userId),
          lessonId: lessonId,
          title: lesson.title,
          bio: lesson.bio,
          coverUrl: lesson.coverUrl,
          pdfUrl: lesson.pdfUrl,
          type: lesson.type,
          lastViewedAt: new Date(), // อัปเดตเวลาล่าสุดที่เข้าชม
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ lesson });

  } catch (err) {
    console.error("GET Lesson Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}