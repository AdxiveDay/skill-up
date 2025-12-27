import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET!;

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
        const more = formData.get("more") as string;
        const type = formData.get("type") as string;
        const coverFile = formData.get("cover") as File;
        const pdfFile = formData.get("pdf") as File;

        if (!title || !type || !coverFile || !pdfFile) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        /* ================= PATH ================= */
        const coverDir = path.join(process.cwd(), "public/uploads/covers");
        const pdfDir = path.join(process.cwd(), "public/uploads/pdfs");


        // ✅ สร้างโฟลเดอร์ (ถ้ายังไม่มี)
        await mkdir(coverDir, { recursive: true });
        await mkdir(pdfDir, { recursive: true });

        const coverName = `${Date.now()}-${coverFile.name}`;
        const pdfName = `${Date.now()}-${pdfFile.name}`;

        const coverPath = `/uploads/covers/${coverName}`;
        const pdfPath = `/uploads/pdfs/${pdfName}`;

        /* ================= SAVE FILE ================= */
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

        await writeFile(path.join(coverDir, coverName), coverBuffer);
        await writeFile(path.join(pdfDir, pdfName), pdfBuffer);

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
            more,
            type, // Physics | Math | Bio
            coverUrl: coverPath,
            pdfUrl: pdfPath,
            createdBy: {
                userId: user._id,
                username: user.username,
            },
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
