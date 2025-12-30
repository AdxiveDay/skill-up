import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ users: [] });
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ Exclude current user and already friended users
    const currentUser = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { friends: 1 } }
    );

    const users = await db
      .collection("users")
      .find(
        {
          username: { $regex: username, $options: "i" },
          _id: {
            $ne: new ObjectId(userId), // ✅ Exclude self
            $nin: currentUser?.friends || [], // ✅ Exclude already friended users
          },
        },
        { projection: { username: 1, level: 1 } }
      )
      .limit(10)
      .toArray();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}