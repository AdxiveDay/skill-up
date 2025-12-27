import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const client = await clientPromise;
    const db = client.db();

    // ดึง history
    const history = await db
      .collection("history")
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ lastViewedAt: -1 })
      .limit(5)
      .toArray();

    // ดึง createdBy ของแต่ละ lesson
    const lessonsIds = history.map((h) => h.lessonId);
    const lessons = await db
      .collection("lessons")
      .find({ _id: { $in: lessonsIds.map((id) => new ObjectId(id)) } })
      .project({ createdBy: 1 }) // เอาเฉพาะ createdBy
      .toArray();

    // map createdBy ไป history
    const historyWithCreatedBy = history.map((h) => {
      const lesson = lessons.find(
        (l) => l._id.toString() === h.lessonId.toString()
      );
      return {
        ...h,
        createdBy: lesson?.createdBy || { username: "Unknown" },
      };
    });

    return NextResponse.json({ history: historyWithCreatedBy });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
