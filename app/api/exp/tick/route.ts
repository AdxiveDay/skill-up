import clientPromise from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    // 1. ดึง user ปัจจุบัน
    const user = await users.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let exp = user.exp ?? 0;
    let level = user.level ?? 1;
    let expMax = user.expMax ?? 100;

    // 2. เพิ่ม EXP
    exp += 5;

    // 3. เช็ค level up
    if (exp >= expMax) {
      exp = exp - expMax;
      level += 1;
      expMax = Math.ceil(expMax * 1.15);
    }

    // 4. อัปเดตกลับเข้า DB
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          exp,
          level,
          expMax,
        },
      }
    );

    return NextResponse.json({
      success: true,
      exp,
      level,
      expMax,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
