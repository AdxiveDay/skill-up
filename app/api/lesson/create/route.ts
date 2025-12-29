import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
        /* ================= AUTH ================= */
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

        /* ================= FORM DATA ================= */
        const formData = await req.formData();
        const title = formData.get("title") as string;
        const bio = formData.get("bio") as string;
        const type = formData.get("type") as string;
        const coverFile = formData.get("cover") as File;
        const pdfFile = formData.get("pdf") as File;

        if (!title || !type || !coverFile || !pdfFile) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        /* ================= UPLOAD HELPER ================= */
        const uploadToCloudinary = (
            file: File,
            folder: string,
            resourceType: "image" | "raw"
        ) => {
            return new Promise<any>(async (resolve, reject) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: resourceType,
                        // ✅ สำหรับ PDF ให้ display inline แทน download
                        ...(resourceType === "raw" && {
                            flags: "attachment",
                        }),
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        /* ================= START UPLOAD ================= */
        // 1. Upload Cover (ภาพปก)
        const coverUpload = await uploadToCloudinary(coverFile, "skillup/covers", "image");

        // 2. Upload PDF (ใช้ resource_type: "raw" เพื่อให้ไฟล์ไม่เสีย)
        const pdfUpload = await uploadToCloudinary(pdfFile, "skillup/pdfs", "raw");

        /* ================= URL MANIPULATION ================= */
        // ✅ ใช้ Google Docs Viewer แทน (วิธีที่ดีที่สุด)
        const optimizedPdfUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUpload.secure_url)}&embedded=true`;

        /* ================= DB ================= */
        const client = await clientPromise;
        const db = client.db();

        const user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(payload.userId) });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await db.collection("lessons").insertOne({
            title,
            bio,
            type,
            coverUrl: coverUpload.secure_url,
            pdfUrl: optimizedPdfUrl, // ✅ ใช้ Google Docs URL
            createdBy: {
                userId: user._id,
                username: user.username,
            },
            createdAt: new Date(),
            visitCount: 0,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Upload Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}