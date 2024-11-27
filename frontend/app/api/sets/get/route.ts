import { Set } from "@/models/set";
import { connectMongoDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { codes } = await req.json();

    if (!Array.isArray(codes)) {
      return NextResponse.json(
        { message: "Codes must be an array" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const sets = await Set.find({ code: { $in: codes } });

    return NextResponse.json({ sets }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not fetch sets: " + error },
      { status: 500 }
    );
  }
}