import { Set } from "@/models/set";
import { connectMongoDB } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

async function generateUniqueCode() {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = String(Math.floor(100000 + Math.random() * 900000));

    const existingSet = await Set.findOne({ code });
    if (!existingSet) {
      isUnique = true;
    }
  }

  return code;
}

// add auth?
export async function POST(req: NextRequest) {
  try {
    const { cards, uid, title } = await req.json();

    await connectMongoDB();

    const code = await generateUniqueCode();

    console.log(cards,code,uid);

    await Set.create({
      cards,
      code,
      uid,
      title
    });

    return NextResponse.json({ code: code }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not create set: " + error },
      { status: 500 }
    );
  }
}