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

    // ✅ Aggregate to get pending requests with user details
    const requests = await db
      .collection("friend_requests")
      .aggregate([
        {
          $match: {
            to: new ObjectId(userId),
            status: "pending",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "from",
            foreignField: "_id",
            as: "fromUser",
          },
        },
        { $unwind: "$fromUser" },
        {
          $project: {
            _id: 1,
            username: "$fromUser.username",
            level: "$fromUser.level",
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // ✅ Sort by newest first
      ])
      .toArray();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("Friend requests error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}