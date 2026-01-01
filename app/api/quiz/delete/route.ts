import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(req: Request) {
  try {
    const { quizSetId } = await req.json();

    if (!quizSetId) {
      return NextResponse.json({ error: "Missing quizSetId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("quizzes").deleteOne({ _id: new ObjectId(quizSetId) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}