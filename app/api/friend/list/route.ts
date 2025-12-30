import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ Get current user's friends array
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { friends: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Fetch friend details
    const friends = await db
      .collection("users")
      .find(
        { _id: { $in: user.friends || [] } },
        { projection: { username: 1, level: 1, _id: 1 } }
      )
      .toArray();

    return NextResponse.json({ friends });
  } catch (err) {
    console.error("Friend list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}