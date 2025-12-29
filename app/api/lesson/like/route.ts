import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

// api/lesson/like/route.ts
// ... (import ส่วนบนเหมือนเดิม)

export async function POST(req: Request) {
  try {
    const { lessonId } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = new ObjectId(payload.userId);

    const client = await clientPromise;
    const db = client.db();

    const lesson = await db.collection("lessons").findOne({ 
        _id: new ObjectId(lessonId),
        likes: userId 
    });

    let isLiked = false;

    if (lesson) {
      await db.collection("lessons").updateOne(
        { _id: new ObjectId(lessonId) },
        { $pull: { likes: userId } } as any
      );
      isLiked = false;
    } else {
      await db.collection("lessons").updateOne(
        { _id: new ObjectId(lessonId) },
        { $addToSet: { likes: userId } } as any
      );
      isLiked = true;
    }

    // ✅ ต้องมีบรรทัดนี้เสมอ เพื่อไม่ให้ฝั่ง Client พัง
    return NextResponse.json({ liked: isLiked });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}