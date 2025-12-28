import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. จำนวน member (accounts)
    const memberCount = await db.collection("users").countDocuments();

    // 2. จำนวน lesson
    const lessonCount = await db.collection("lessons").countDocuments();

    // 3. จำนวน type (นับแบบไม่ซ้ำ)
    const types = await db
      .collection("lessons")
      .distinct("type");

    return NextResponse.json({
      memberCount,
      lessonCount,
      typeCount: types.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
