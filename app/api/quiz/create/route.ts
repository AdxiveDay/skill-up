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
    const { lessonId, quizzes } = await req.json();

    if (!lessonId || !quizzes || quizzes.length < 3) {
      return NextResponse.json({ error: "Need at least 3 questions" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ สร้าง Quiz Set เดียว (1 set = multiple questions)
    const result = await db.collection("quizzes").insertOne({
      lessonId: new ObjectId(lessonId),
      createdBy: new ObjectId(payload.userId),
      questions: quizzes, // Array ของ questions
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, quizSetId: result.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
