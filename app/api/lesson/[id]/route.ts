import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const client = await clientPromise;
    const db = client.db();

    /* ================= GET LESSON ================= */
    const lesson = await db.collection("lessons").findOne({
      _id: new ObjectId(id),
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    /* ================= SAVE HISTORY ================= */
    await db.collection("history").updateOne(
      {
        userId: new ObjectId(payload.userId),
        lessonId: lesson._id,
      },
      {
        $set: {
          userId: new ObjectId(payload.userId),
          lessonId: lesson._id,
          title: lesson.title,
          bio: lesson.bio,
          more: lesson.more,
          coverUrl: lesson.coverUrl,
          pdfUrl: lesson.pdfUrl,
          type: lesson.type,
          lastViewedAt: new Date(),
        },
      },
      { upsert: true } // ✅ ถ้าเคยดูแล้ว = อัปเดตเวลา
    );

    return NextResponse.json({ lesson });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
