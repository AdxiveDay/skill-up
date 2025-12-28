import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

// [id]/route.ts
// ... (import เดิม)

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

    /* ================= VISIT COUNT (Fixed Logic) ================= */
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentView = await db.collection("history").findOne({
      userId: new ObjectId(payload.userId),
      lessonId: lessonId,
      lastViewedAt: { $gte: oneMinuteAgo } // ดูในช่วง 1 นาทีที่ผ่านมา
    });

    let lessonData;

    if (!recentView) {
      // 2. ถ้าไม่เคยดู (หรือดูนานแล้ว) -> ให้บวกยอด Visit
      const result = await db.collection("lessons").findOneAndUpdate(
        { _id: lessonId },
        { $inc: { visitCount: 1 } },
        { returnDocument: "after" }
      );
      lessonData = result?.value || result;
    } else {
      // 3. ถ้าเพิ่งดูไป -> แค่ดึงข้อมูลมาโชว์เฉยๆ ไม่ต้องบวกยอด
      lessonData = await db.collection("lessons").findOne({ _id: lessonId });
    }

    if (!lessonData) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = {
      ...lessonData,
      visitCount: lessonData.visitCount ?? 1,
    };

    /* ================= SAVE HISTORY ================= */
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
          lastViewedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ lesson });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}