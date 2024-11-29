import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { Set } from "@/models/set";
import { connectMongoDB } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { message: "UID is required" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    
    const user = await User.findOne({ omiUid: uid });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const sets = await Set.find({ uid });

    return NextResponse.json(
      { user, sets },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching user data: " + error },
      { status: 500 }
    );
  }
}
