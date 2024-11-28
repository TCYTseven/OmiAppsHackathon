import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { connectMongoDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, userid } = await req.json();

    if (!username || !userid) {
      return NextResponse.json(
        { message: "Username and userid are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { omiUid: userid }]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username or userid already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      username,
      omiUid: userid
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user: " + error },
      { status: 500 }
    );
  }
}
