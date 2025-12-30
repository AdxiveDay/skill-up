import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    // ✅ Validate targetUserId format
    if (!targetUserId || !ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ✅ Prevent adding yourself
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot add yourself as friend" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ Check if target user exists
    const targetUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(targetUserId) });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Check if already friends
    const userDoc = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (userDoc?.friends?.includes(new ObjectId(targetUserId))) {
      return NextResponse.json(
        { error: "Already friends" },
        { status: 400 }
      );
    }

    // ✅ Check if request already sent
    const exists = await db.collection("friend_requests").findOne({
      from: new ObjectId(userId),
      to: new ObjectId(targetUserId),
      status: "pending",
    });

    if (exists) {
      return NextResponse.json(
        { error: "Request already sent" },
        { status: 400 }
      );
    }

    // ✅ Check if there's a pending request from target user
    const reverseRequest = await db.collection("friend_requests").findOne({
      from: new ObjectId(targetUserId),
      to: new ObjectId(userId),
      status: "pending",
    });

    if (reverseRequest) {
      return NextResponse.json(
        { error: "User already sent you a request" },
        { status: 400 }
      );
    }

    // ✅ Create friend request
    await db.collection("friend_requests").insertOne({
      from: new ObjectId(userId),
      to: new ObjectId(targetUserId),
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Friend request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}