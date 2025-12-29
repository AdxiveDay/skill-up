// api/lesson/add/route.ts (หรือชื่อไฟล์ของคุณ)
import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // นำเข้า cookies
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET!;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    /* ================= AUTH (FIXED: await cookies) ================= */
    const cookieStore = await cookies(); // ✅ ต้อง await ใน Next.js 15
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const more = formData.get("more") as string;
    const type = formData.get("type") as string;
    const coverFile = formData.get("cover") as File;
    const pdfFile = formData.get("pdf") as File;

    if (!title || !type || !coverFile || !pdfFile) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    /* ================= UPLOAD TO CLOUDINARY ================= */
    // Helper function สำหรับลดความซับซ้อนของโค้ด
    const uploadToCloudinary = async (file: File, folder: string, resourceType: "image" | "raw") => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      return new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });
    };

    const coverUpload = await uploadToCloudinary(coverFile, "skillup/covers", "image");
    const pdfUpload = await uploadToCloudinary(pdfFile, "skillup/pdfs", "raw");

    /* ================= DB ================= */
    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // แทรกข้อมูลลงใน Collection "lessons"
    const newLesson = await db.collection("lessons").insertOne({
      title,
      bio,
      more,
      type,
      coverUrl: coverUpload.secure_url,
      pdfUrl: pdfUpload.secure_url,
      createdBy: {
        userId: user._id,
        username: user.username,
      },
      createdAt: new Date(),
      visitCount: 0, // ✅ ต้องใส่ไว้เพื่อให้ API ตัวนับวิวทำงานได้
    });

    return NextResponse.json({ success: true, lessonId: newLesson.insertedId });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}