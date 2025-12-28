// list/route.ts
import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const client = await clientPromise;
    const db = client.db();

    const query = !type || type === "All" ? {} : { type };

    const lessons = await db
      .collection("lessons")
      .find(query)
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .toArray();

    // ส่งออกไปตรงๆ (MongoDB จะรวม visitCount ไปให้ถ้ามีข้อมูลในเครื่อง)
    return NextResponse.json({ lessons });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}