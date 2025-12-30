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

    const { requestId } = await req.json();

    // ✅ Validate requestId
    if (!requestId || !ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ Find request
    const request = await db.collection("friend_requests").findOne({
      _id: new ObjectId(requestId),
      to: new ObjectId(userId),
      status: "pending",
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found or already processed" },
        { status: 404 }
      );
    }

    // ✅ Add to both users' friends array
    await db.collection("users").updateOne(
      { _id: request.from },
      { $addToSet: { friends: request.to } }
    );

    await db.collection("users").updateOne(
      { _id: request.to },
      { $addToSet: { friends: request.from } }
    );

    // ✅ Mark request as accepted
    await db.collection("friend_requests").updateOne(
      { _id: request._id },
      { $set: { status: "accepted", acceptedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Accept friend error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}