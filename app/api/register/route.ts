import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 1️⃣ validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // 2️⃣ เช็ก username ซ้ำ
    const existingUsername = await db
      .collection("users")
      .findOne({ username });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // 3️⃣ เช็ก email ซ้ำ
    const existingEmail = await db
      .collection("users")
      .findOne({ email });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // 4️⃣ hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5️⃣ insert user
    await db.collection("users").insertOne({
      username,
      email,
      passwordHash,

      level: 1,
      exp: 0,
      expMax: 100,

      createdAt: new Date()
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}
