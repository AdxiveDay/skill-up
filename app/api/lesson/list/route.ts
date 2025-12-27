import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const client = await clientPromise;
  const db = client.db();

  const query =
    !type || type === "All"
      ? {}
      : { type };;

  const lessons = await db
    .collection("lessons")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ lessons });
}
